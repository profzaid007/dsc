// Used by tools/build-security-artifacts.cjs. Generated migration is standalone.
function installSecurity(app, policy) {
  const dates = [
    { name: "created", type: "autodate", onCreate: true },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
  ]
  const text = (name, required = false, max = 200) => ({
    name,
    type: "text",
    required,
    max,
  })
  const relation = (name, collectionId) => ({
    name,
    type: "relation",
    collectionId,
    required: true,
    maxSelect: 1,
    cascadeDelete: false,
  })
  const fieldType = (field) =>
    typeof field.type === "function" ? field.type() : String(field.type)
  const make = (name, id, fields, indexes) => {
    let existing
    try {
      existing = app.findCollectionByNameOrId(name)
    } catch {}
    if (existing) {
      if (existing.id !== id)
        throw new Error("Unexpected security collection identity: " + name)
      return existing
    }
    const c = new Collection({
      id,
      name,
      type: "base",
      fields: fields.concat(dates),
      indexes: indexes || [],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    })
    try {
      app.save(c)
    } catch (error) {
      throw new Error(
        "Security policy migration for " +
          name +
          ": " +
          error +
          " Rules: " +
          JSON.stringify({
            list: c.listRule,
            create: c.createRule,
            update: c.updateRule,
            delete: c.deleteRule,
          })
      )
    }
    return c
  }
  const users = app.findCollectionByNameOrId("users")
  const roles = make(
    "security_roles",
    "dscsecroles0001",
    [
      text("key", true, 80),
      text("name_en", true, 120),
      text("name_ar", false, 120),
      text("description", false, 1000),
      { name: "is_active", type: "bool" },
      { name: "is_system", type: "bool" },
    ],
    ["CREATE UNIQUE INDEX idx_security_role_key ON security_roles (key)"]
  )
  const permissions = make(
    "security_permissions",
    "dscsecperms0001",
    [
      text("key", true, 100),
      text("module", true, 80),
      text("action", true, 80),
      text("name_en", true),
      text("name_ar"),
    ],
    [
      "CREATE UNIQUE INDEX idx_security_permission_key ON security_permissions (key)",
    ]
  )
  const grants = make(
    "security_role_permissions",
    "dscsecgrants001",
    [relation("role", roles.id), relation("permission", permissions.id)],
    [
      "CREATE UNIQUE INDEX idx_security_role_permission ON security_role_permissions (role, permission)",
    ]
  )
  const assignments = make(
    "security_user_roles",
    "dscsecassign001",
    [relation("user", users.id), relation("role", roles.id)],
    [
      "CREATE UNIQUE INDEX idx_security_user_role ON security_user_roles (user, role)",
    ]
  )
  make(
    "security_audit_log",
    "dscsecaudit0001",
    [
      text("actor", true, 15),
      text("action", true, 80),
      text("target_type", true, 80),
      text("target_id", true, 100),
      { name: "before", type: "json", maxSize: 20000 },
      { name: "after", type: "json", maxSize: 20000 },
    ],
    ["CREATE INDEX idx_security_audit_created ON security_audit_log (created)"]
  )
  const existingProjection = users.fields.getByName("security_permissions")
  if (existingProjection && fieldType(existingProjection) !== "select")
    throw new Error(
      "Unexpected security_permissions field type; review schema state."
    )
  if (existingProjection) {
    existingProjection.values = policy.catalog.map(p => p.key)
    existingProjection.maxSelect = policy.catalog.length
  }
  if (!existingProjection)
    users.fields.add(
      new SelectField({
        name: "security_permissions",
        values: policy.catalog.map((p) => p.key),
        maxSelect: policy.catalog.length,
      })
    )
  // PocketBase reloads the auth record for each request. This server-maintained
  // projection also lets native collection rules filter records and realtime.
  try {
    app.save(users)
  } catch (error) {
    throw new Error("Security users projection: " + error)
  }
  for (const name of Object.keys(policy.collectionModules)) {
    let c
    try {
      c = app.findCollectionByNameOrId(name)
    } catch {
      continue
    }
    if (
      String(c.listRule || "").includes(
        "@request.auth.security_permissions:each"
      )
    )
      continue
    for (const field of [
      "listRule",
      "viewRule",
      "createRule",
      "updateRule",
      "deleteRule",
    ]) {
      const action =
        field === "listRule" || field === "viewRule"
          ? "read"
          : field.replace("Rule", "")
      c[field] = policy.rewriteRule(
        c[field],
        policy.collectionModules[name],
        action
      )
      if (c[field] !== null && c[field] !== undefined) {
        if (String(c[field]) === "") c[field] = '@request.method != ""'
        // All private access requires an active account, while genuine public
        // branches continue to function without authentication.
        const registration =
          name === "expert_profiles" && field === "createRule"
            ? ' || (@request.auth.role = "expert" && user = @request.auth.id)'
            : ""
        c[field] =
          '(@request.auth.id = "" || @request.auth.is_active = true' +
          registration +
          ") && (" +
          c[field] +
          ")"
      }
    }
    // Rules that historically allowed any signed-in user/public creation must
    // not let staff bypass the permission check through that fallback.
    for (const field of [
      "listRule",
      "viewRule",
      "createRule",
      "updateRule",
      "deleteRule",
    ]) {
      if (c[field] === null || c[field] === undefined) continue
      const action =
        field === "listRule" || field === "viewRule"
          ? "read"
          : field.replace("Rule", "")
      if (action === "read" && policy.publicReadCollections.includes(name))
        continue
      c[field] =
        "(" +
        c[field] +
        ') && (@request.auth.role != "admin" || ' +
        policy.permissionsRule(policy.collectionModules[name], action) +
        ")"
    }
    if (name === "users") {
      const expertDirectory =
        '(@request.auth.is_active = true && role = "expert" && ' +
        policy.adminRule("experts.read") +
        ")"
      c.listRule = "(" + c.listRule + ") || " + expertDirectory
      c.viewRule = "(" + c.viewRule + ") || " + expertDirectory
      for (const action of ["update", "delete"])
        c[action + "Rule"] =
          "(" +
          c[action + "Rule"] +
          ') || (@request.auth.is_active = true && role = "expert" && ' +
          policy.adminRule("experts." + action) +
          ")"
      c.manageRule =
        '@request.auth.is_active = true && (@request.auth.role = "super_admin" || ' +
        policy.adminRule("users.reset_password") +
        ")"
      c.updateRule =
        "(" +
        c.updateRule +
        ") && @request.body.security_permissions:isset = false"
      c.createRule =
        "(" +
        c.createRule +
        ") && @request.body.security_permissions:isset = false"
    }
    if (name === "cases") {
      const payments =
        "(@request.auth.is_active = true && " +
        policy.adminRule("payments.read") +
        ")"
      c.listRule = "(" + c.listRule + ") || " + payments
      c.viewRule = "(" + c.viewRule + ") || " + payments
      c.createRule =
        '@request.auth.is_active = true && (@request.auth.role = "super_admin" || ' +
        policy.adminRule("cases.create") +
        ' || (@request.auth.role != "admin" && @request.auth.role != "expert" && user = @request.auth.id))'
    }
    if (
      [
        "individual_profiles",
        "parent_profiles",
        "organization_profiles",
      ].includes(name)
    ) {
      c.createRule =
        '@request.auth.is_active = true && (@request.auth.role = "super_admin" || ' +
        policy.adminRule("users.create") +
        ' || (@request.auth.role != "admin" && user = @request.auth.id))'
    }
    try {
      app.save(c)
    } catch (error) {
      throw new Error(
        "Security rules for " +
          name +
          ": " +
          error +
          " Rules: " +
          JSON.stringify({
            list: c.listRule,
            create: c.createRule,
            update: c.updateRule,
            delete: c.deleteRule,
          })
      )
    }
  }
  // Sensitive uploads must go through PocketBase view rules and file tokens.
  for (const name of [
    "users",
    "cases",
    "case_tools",
    "expert_profiles",
    "expert_bank_details",
    "individual_profiles",
    "parent_profiles",
    "organization_profiles",
    "event_certificates",
  ]) {
    let c
    try {
      c = app.findCollectionByNameOrId(name)
    } catch {
      continue
    }
    for (const field of c.fields)
      if (
        fieldType(field) === "file" &&
        !["avatar", "profile_photo"].includes(field.name)
      )
        field.protected = true
    try {
      app.save(c)
    } catch (error) {
      throw new Error("Security files for " + name + ": " + error)
    }
  }
  let role
  try {
    role = app.findFirstRecordByFilter(
      "security_roles",
      'key = "administrator"'
    )
  } catch {}
  const seedCompatibility = !role
  if (!role) role = new Record(roles)
  if (seedCompatibility) {
    role.set("key", "administrator")
    role.set("name_en", "Administrator")
    role.set("name_ar", "مسؤول النظام")
    role.set(
      "description",
      "Compatibility role for existing administrators. Review and narrow grants after migration."
    )
    role.set("is_active", true)
    role.set("is_system", true)
    app.save(role)
  }
  for (const p of policy.catalog) {
    let record
    try {
      record = app.findFirstRecordByFilter(
        "security_permissions",
        "key = {:key}",
        { key: p.key }
      )
    } catch {}
    if (!record) record = new Record(permissions)
    for (const key of Object.keys(p)) record.set(key, p[key])
    app.save(record)
    if (seedCompatibility) {
      const grant = new Record(grants)
      grant.set("role", role.id)
      grant.set("permission", record.id)
      app.save(grant)
    }
  }
  const admins = app.findRecordsByFilter("users", 'role = "admin"', "", 0, 0)
  for (const admin of admins) {
    if (!seedCompatibility) continue
    const a = new Record(assignments)
    a.set("user", admin.id)
    a.set("role", role.id)
    app.save(a)
    admin.set(
      "security_permissions",
      admin.getBool("is_active") ? policy.catalog.map((p) => p.key) : []
    )
    app.save(admin)
  }
}
module.exports = installSecurity
