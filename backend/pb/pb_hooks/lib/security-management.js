const policy = require(`${__hooks}/lib/security-policy.js`)
const all = (app, name, filter = "", params = {}) =>
  app.findRecordsByFilter(name, filter, "", 0, 0, params)
function roleData(app, role) {
  const permissions = all(app, "security_role_permissions", "role = {:id}", {
    id: role.id,
  }).map((g) =>
    app
      .findRecordById("security_permissions", g.getString("permission"))
      .getString("key")
  )
  return {
    id: role.id,
    key: role.getString("key"),
    name_en: role.getString("name_en"),
    name_ar: role.getString("name_ar"),
    description: role.getString("description"),
    is_active: role.getBool("is_active"),
    is_system: role.getBool("is_system"),
    permissions: permissions.sort(),
    user_count: app.countRecords(
      "security_user_roles",
      $dbx.exp("role = {:id}", { id: role.id })
    ),
  }
}
function auditData(record) {
  return {
    id: record.id,
    actor: record.getString("actor"),
    action: record.getString("action"),
    target_type: record.getString("target_type"),
    target_id: record.getString("target_id"),
    before: record.get("before"),
    after: record.get("after"),
    created: record.getString("created"),
  }
}
function auditPage(e) {
  policy.requireSuper(e.app, e.auth)
  const requested = Number(e.request.url.query().get("page") || 1)
  if (!Number.isInteger(requested) || requested < 1 || requested > 100000)
    throw new BadRequestError("Invalid page.")
  const count = e.app.countRecords("security_audit_log")
  return {
    items: e.app
      .findRecordsByFilter(
        "security_audit_log",
        "",
        "-created,-id",
        50,
        (requested - 1) * 50
      )
      .map(auditData),
    page: requested,
    totalPages: Math.ceil(count / 50),
    totalItems: count,
  }
}
function state(e) {
  const actor = policy.requirePermission(e.app, e.auth, "security.read")
  const roles = all(e.app, "security_roles").map((r) => roleData(e.app, r))
  const permissions = all(e.app, "security_permissions").map((r) => ({
    id: r.id,
    key: r.getString("key"),
    module: r.getString("module"),
    action: r.getString("action"),
    name_en: r.getString("name_en"),
    name_ar: r.getString("name_ar"),
  }))
  const users = all(e.app, "users").map((u) => ({
    id: u.id,
    name: u.getString("name"),
    email: u.getString("email"),
    role: u.getString("role"),
    is_active: u.getBool("is_active"),
    roles: all(e.app, "security_user_roles", "user = {:id}", { id: u.id }).map(
      (a) => a.getString("role")
    ),
    permissions: policy.effective(e.app, u),
  }))
  return {
    roles,
    permissions,
    users,
    audit: actor.getString("role") === "super_admin" ? auditPage(e).items : [],
  }
}
function inputString(body, key, max, required) {
  const value = body[key]
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  )
    throw new BadRequestError("Invalid " + key)
  return value.trim()
}
function saveRole(e, create) {
  const body = e.requestInfo().body
  const grants = policy.validateGrants(body.permissions)
  const nameEn = inputString(body, "name_en", 120, true)
  const nameAr = inputString(body, "name_ar", 120, false)
  const description = inputString(body, "description", 1000, false)
  if (typeof body.is_active !== "boolean")
    throw new BadRequestError("Invalid role status.")
  e.app.runInTransaction((app) => {
    const actor = policy.requireSuper(app, e.auth)
    const role = create
      ? new Record(app.findCollectionByNameOrId("security_roles"))
      : app.findRecordById("security_roles", e.request.pathValue("id"))
    const before = create ? null : roleData(app, role)
    if (create) {
      const key = inputString(body, "key", 80, true)
      if (!/^[a-z][a-z0-9_-]{1,79}$/.test(key))
        throw new BadRequestError(
          "Role key must use lowercase letters, numbers, underscores or hyphens."
        )
      role.set("key", key)
    } else if (body.key !== undefined && body.key !== role.getString("key"))
      throw new BadRequestError("Role key cannot be changed.")
    role.set("name_en", nameEn)
    role.set("name_ar", nameAr)
    role.set("description", description)
    role.set("is_active", body.is_active)
    app.save(role)
    for (const r of all(app, "security_role_permissions", "role = {:id}", {
      id: role.id,
    }))
      app.delete(r)
    for (const key of grants) {
      const permission = app.findFirstRecordByFilter(
        "security_permissions",
        "key = {:key}",
        { key }
      )
      const r = new Record(
        app.findCollectionByNameOrId("security_role_permissions")
      )
      r.set("role", role.id)
      r.set("permission", permission.id)
      app.save(r)
    }
    for (const a of all(app, "security_user_roles", "role = {:id}", {
      id: role.id,
    }))
      policy.compile(app, a.getString("user"))
    policy.audit(
      app,
      actor,
      create ? "role.create" : "role.update",
      "security_roles",
      role.id,
      before,
      roleData(app, role)
    )
  })
  return { success: true }
}
function deleteRole(e) {
  e.app.runInTransaction((app) => {
    const actor = policy.requireSuper(app, e.auth)
    const role = app.findRecordById("security_roles", e.request.pathValue("id"))
    const before = roleData(app, role)
    if (role.getBool("is_system"))
      throw new BadRequestError("System roles cannot be deleted.")
    if (before.user_count)
      throw new BadRequestError(
        "This role is assigned to users. Deactivate it instead."
      )
    for (const r of all(app, "security_role_permissions", "role = {:id}", {
      id: role.id,
    }))
      app.delete(r)
    app.delete(role)
    policy.audit(
      app,
      actor,
      "role.delete",
      "security_roles",
      role.id,
      before,
      null
    )
  })
  return { success: true }
}
function assignRoles(e) {
  const ids = e.requestInfo().body.roles
  if (
    !Array.isArray(ids) ||
    ids.length > 100 ||
    ids.some((id) => typeof id !== "string" || !/^[a-z0-9]{15}$/.test(id)) ||
    new Set(ids).size !== ids.length
  )
    throw new BadRequestError("Invalid role list.")
  e.app.runInTransaction((app) => {
    const actor = policy.requirePermission(app, e.auth, "security.assign_roles")
    const user = app.findRecordById("users", e.request.pathValue("id"))
    for (const id of ids) app.findRecordById("security_roles", id)
    const assignments = all(app, "security_user_roles", "user = {:id}", {
      id: user.id,
    })
    const before = assignments.map((a) => a.getString("role"))
    if (actor.getString("role") !== "super_admin") {
      if (user.getString("role") === "super_admin")
        throw new ForbiddenError(
          "Only Super Admin can change Super Admin access."
        )
      const capacity = policy.effective(app, actor)
      const changed = ids
        .filter((id) => !before.includes(id))
        .concat(before.filter((id) => !ids.includes(id)))
      for (const id of changed) {
        if (
          roleData(
            app,
            app.findRecordById("security_roles", id)
          ).permissions.some((key) => !capacity.includes(key))
        )
          throw new ForbiddenError(
            "You cannot assign or remove a role beyond your own permissions."
          )
      }
    }
    for (const a of assignments) app.delete(a)
    for (const id of ids) {
      const a = new Record(app.findCollectionByNameOrId("security_user_roles"))
      a.set("user", user.id)
      a.set("role", id)
      app.save(a)
    }
    policy.compile(app, user.id)
    policy.audit(
      app,
      actor,
      "user.roles.update",
      "users",
      user.id,
      { roles: before },
      { roles: ids }
    )
  })
  return { success: true }
}
// Called inside a transaction for native user mutation requests. Logging is
// atomic with the mutation and never includes passwords or authentication data.
function guardUserMutation(e, action) {
  const body = e.requestInfo().body
  const record = e.record
  if (e.hasSuperuserAuth()) return e.next()
  if (
    Object.keys(body).some(
      (key) =>
        key === "security_permissions" || key.startsWith("security_permissions")
    )
  )
    throw new ForbiddenError("Effective permissions are managed by the server.")
  const actor = e.auth ? policy.freshUser(e.app, e.auth) : null
  const superAdmin = actor && actor.getString("role") === "super_admin"
  const before =
    action === "create" ? null : e.app.findRecordById("users", record.id)
  const targetRole = record.getString("role")
  const oldRole = before ? before.getString("role") : ""
  if (
    action !== "delete" &&
    ![
      "super_admin",
      "admin",
      "expert",
      "individual",
      "parent",
      "care_foundation",
      "organization",
    ].includes(targetRole)
  )
    throw new BadRequestError("Invalid account type.")
  const privileged = (role) => role === "admin" || role === "super_admin"
  if (!superAdmin) {
    if (
      (action === "create" && privileged(targetRole)) ||
      (before &&
        (oldRole === "super_admin" ||
          (oldRole === "admin" && (!actor || record.id !== actor.id)) ||
          targetRole !== oldRole))
    )
      throw new ForbiddenError(
        "Only Super Admin can manage account types or privileged accounts."
      )
    if (
      action === "create" &&
      ![
        "expert",
        "individual",
        "parent",
        "care_foundation",
        "organization",
      ].includes(targetRole)
    )
      throw new BadRequestError("Invalid account type.")
    if (
      action === "create" &&
      targetRole === "expert" &&
      record.getBool("is_active")
    )
      throw new ForbiddenError("New expert accounts require approval.")
    if (before && record.getBool("is_active") !== before.getBool("is_active")) {
      const approval =
        oldRole === "expert" &&
        !before.getBool("is_active") &&
        record.getBool("is_active")
      if (!approval)
        throw new ForbiddenError("Only Super Admin can change account status.")
      policy.requirePermission(e.app, actor, "experts.approve")
    }
    if (
      actor &&
      actor.getString("role") === "admin" &&
      (body.password !== undefined || body.passwordConfirm !== undefined) &&
      action !== "create"
    )
      policy.requirePermission(e.app, actor, "users.reset_password")
  }
  if (
    before &&
    actor &&
    record.id === actor.id &&
    (action === "delete" ||
      !record.getBool("is_active") ||
      (oldRole === "super_admin" && targetRole !== oldRole))
  )
    throw new BadRequestError(
      "You cannot delete, deactivate, or demote your own account."
    )
  if (
    before &&
    oldRole === "super_admin" &&
    before.getBool("is_active") &&
    (action === "delete" ||
      targetRole !== oldRole ||
      !record.getBool("is_active"))
  ) {
    if (
      e.app.countRecords(
        "users",
        $dbx.exp("role = {:role} AND is_active = true", { role: "super_admin" })
      ) <= 1
    )
      throw new BadRequestError("At least one active Super Admin must remain.")
  }
  if (action === "delete") {
    if (
      e.app.countRecords(
        "cases",
        $dbx.exp("user = {:id}", { id: record.id })
      ) ||
      e.app.countRecords(
        "case_experts",
        $dbx.exp("expert_id = {:id}", { id: record.id })
      )
    )
      throw new BadRequestError(
        "This user has linked cases or expert assignments."
      )
    for (const a of all(e.app, "security_user_roles", "user = {:id}", {
      id: record.id,
    }))
      e.app.delete(a)
    // Deleting an account and its owned profiles is one operation. The browser
    // must not delete profiles first and leave partial data if user deletion fails.
    for (const collection of [
      "individual_profiles",
      "parent_profiles",
      "organization_profiles",
      "expert_profiles",
      "expert_bank_details",
    ]) {
      for (const profile of all(e.app, collection, "user = {:id}", {
        id: record.id,
      }))
        e.app.delete(profile)
    }
  }
  // Keep the query-rule projection in sync when account status/type changes.
  if (action !== "delete")
    record.set("security_permissions", policy.effective(e.app, record))
  const result = e.next()
  const changedAccess =
    action !== "update" ||
    oldRole !== targetRole ||
    before.getBool("is_active") !== record.getBool("is_active")
  if (actor && (changedAccess || body.password !== undefined)) {
    const safe = (r) =>
      r
        ? { role: r.getString("role"), is_active: r.getBool("is_active") }
        : null
    policy.audit(
      e.app,
      actor,
      body.password !== undefined && action === "update"
        ? "user.password.reset"
        : "user." + action,
      "users",
      record.id,
      safe(before),
      action === "delete" ? null : safe(record)
    )
  }
  return result
}
module.exports = {
  state,
  auditPage,
  saveRole,
  deleteRole,
  assignRoles,
  guardUserMutation,
}
