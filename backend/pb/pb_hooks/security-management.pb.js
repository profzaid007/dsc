routerAdd(
  "GET",
  "/api/dsc/security/me",
  (e) => {
    const p = require(`${__hooks}/lib/security-policy.js`)
    const user = p.freshUser(e.app, e.auth)
    return e.json(200, {
      permissions: p.effective(e.app, user),
      is_super_admin: user.getString("role") === "super_admin",
    })
  },
  $apis.requireAuth("users")
)
routerAdd(
  "GET",
  "/api/dsc/security/state",
  (e) => e.json(200, require(`${__hooks}/lib/security-management.js`).state(e)),
  $apis.requireAuth("users")
)
routerAdd(
  "GET",
  "/api/dsc/security/audit",
  (e) =>
    e.json(200, require(`${__hooks}/lib/security-management.js`).auditPage(e)),
  $apis.requireAuth("users")
)
routerAdd(
  "POST",
  "/api/dsc/security/roles",
  (e) =>
    e.json(
      200,
      require(`${__hooks}/lib/security-management.js`).saveRole(e, true)
    ),
  $apis.requireAuth("users")
)
routerAdd(
  "PATCH",
  "/api/dsc/security/roles/{id}",
  (e) =>
    e.json(
      200,
      require(`${__hooks}/lib/security-management.js`).saveRole(e, false)
    ),
  $apis.requireAuth("users")
)
routerAdd(
  "DELETE",
  "/api/dsc/security/roles/{id}",
  (e) =>
    e.json(200, require(`${__hooks}/lib/security-management.js`).deleteRole(e)),
  $apis.requireAuth("users")
)
routerAdd(
  "PUT",
  "/api/dsc/security/users/{id}/roles",
  (e) =>
    e.json(
      200,
      require(`${__hooks}/lib/security-management.js`).assignRoles(e)
    ),
  $apis.requireAuth("users")
)
routerAdd(
  "GET",
  "/api/dsc/security/users/{id}/deletion-check",
  (e) => {
    const p = require(`${__hooks}/lib/security-policy.js`)
    const current = p.freshUser(e.app, e.auth)
    for (const name of ["security_user_roles", "security_audit_log", "cases", "case_experts"]) {
      try { e.app.findCollectionByNameOrId(name) }
      catch { throw new BadRequestError("Account deletion is unavailable because " + name + " is missing from the backend. Apply the security schema update. No account was deleted.") }
    }
    const matches = e.app.findRecordsByFilter("users", "id = {:id}", "", 1, 0, {id:e.request.pathValue("id")})
    if (!matches.length) throw new BadRequestError("This account no longer exists. Refresh the user list.")
    const user = matches[0]
    const actor = p.requirePermission(
      e.app,
      current,
      user.getString("role") === "expert" &&
        !p.effective(e.app, current).includes("users.delete")
        ? "experts.delete"
        : "users.delete"
    )
    if (user.id === actor.id)
      throw new BadRequestError("You cannot delete your own account.")
    if (
      ["admin", "super_admin"].includes(user.getString("role")) &&
      actor.getString("role") !== "super_admin"
    )
      throw new ForbiddenError(
        "Only Super Admin can manage privileged accounts."
      )
    return e.json(200, {
      cases: e.app.countRecords(
        "cases",
        $dbx.exp("user = {:id}", { id: user.id })
      ),
      assignments: e.app.countRecords(
        "case_experts",
        $dbx.exp("expert_id = {:id}", { id: user.id })
      ),
    })
  },
  $apis.requireAuth("users")
)
routerAdd(
  "POST",
  "/api/dsc/security/experts/{id}/approve",
  (e) => {
    const p = require(`${__hooks}/lib/security-policy.js`)
    e.app.runInTransaction((app) => {
      const actor = p.requirePermission(app, e.auth, "experts.approve")
      try { app.findCollectionByNameOrId("security_audit_log") }
      catch { throw new BadRequestError("Expert approval is unavailable because security_audit_log is missing. Apply the security audit schema update. No account was approved.") }
      const matches = app.findRecordsByFilter("users", "id = {:id}", "", 1, 0, {id:e.request.pathValue("id")})
      if (!matches.length) throw new BadRequestError("This expert account no longer exists. Refresh the expert list before trying again.")
      const user = matches[0]
      const profiles = app.findRecordsByFilter("expert_profiles", "user = {:id}", "", 1, 0, {id:user.id})
      if (!profiles.length) throw new BadRequestError("This expert has no submitted application profile. Approval was not performed.")
      if (user.getString("role") !== "expert" || user.getBool("is_active"))
        throw new BadRequestError(
          "Only pending expert accounts can be approved."
        )
      user.set("is_active", true)
      app.save(user)
      p.audit(
        app,
        actor,
        "expert.approve",
        "users",
        user.id,
        { is_active: false },
        { is_active: true }
      )
    })
    return e.json(200, { success: true })
  },
  $apis.requireAuth("users")
)
routerAdd(
  "GET",
  "/api/dsc/payments",
  (e) => e.json(200, require(`${__hooks}/lib/security-payments.js`).list(e)),
  $apis.requireAuth("users")
)
routerAdd(
  "PATCH",
  "/api/dsc/payments/{id}",
  (e) => e.json(200, require(`${__hooks}/lib/security-payments.js`).update(e)),
  $apis.requireAuth("users")
)
routerAdd(
  "GET",
  "/api/dsc/payments/export",
  (e) => {
    require(`${__hooks}/lib/security-policy.js`).requirePermission(
      e.app,
      e.auth,
      "payments.export"
    )
    return e.json(200, require(`${__hooks}/lib/security-payments.js`).list(e))
  },
  $apis.requireAuth("users")
)

// Native rules are authoritative for record scopes, list filtering, expansion,
// files, and realtime. Request checks additionally reject whole denied requests
// (instead of returning an empty list) and close public-rule staff fallbacks.
onRecordsListRequest((e) => {
  if (!e.hasSuperuserAuth() && e.auth) {
    const p = require(`${__hooks}/lib/security-policy.js`)
    const u = p.freshUser(e.app, e.auth)
    const moduleName = p.collectionModules[e.collection.name]
    if (moduleName && u.getString("role") === "admin") {
      if (p.publicReadCollections.includes(e.collection.name)) return e.next()
      if (
        e.collection.name === "users" &&
        p.effective(e.app, u).includes("experts.read")
      )
        return e.next()
      if (
        e.collection.name === "cases" &&
        p.effective(e.app, u).includes("payments.read")
      )
        return e.next()
      if (moduleName === "events") {
        const grants = p.effective(e.app, u)
        if (
          !grants.includes("training.read") &&
          !grants.includes("lectures.read")
        )
          throw new ForbiddenError("Event read permission required.")
      } else p.requirePermission(e.app, u, moduleName + ".read")
    }
  }
  return e.next()
})
onRecordViewRequest((e) => {
  if (!e.hasSuperuserAuth() && e.auth)
    require(`${__hooks}/lib/security-policy.js`).freshUser(e.app, e.auth)
  return e.next()
})
onRecordCreateRequest((e) => {
  if (e.hasSuperuserAuth()) return e.next()
  const p = require(`${__hooks}/lib/security-policy.js`)
  if (e.auth) {
    if (
      e.collection.name === "expert_profiles" &&
      e.auth.getString("role") === "expert" &&
      e.record.getString("user") === e.auth.id
    )
      return e.next()
    const u = p.freshUser(e.app, e.auth)
    const moduleName = p.collectionModules[e.collection.name]
    if (moduleName && u.getString("role") === "admin")
      p.requirePermission(
        e.app,
        u,
        (moduleName === "events"
          ? e.record.getString("lecture_id")
            ? "lectures"
            : "training"
          : moduleName) + ".create"
      )
    if (
      e.collection.name === "cases" &&
      u.getString("role") !== "super_admin"
    ) {
      const hasPayment =
        e.record.getBool("is_paid") ||
        e.record.getFloat("payment_amount") > 0 ||
        ["active", "awaiting_payment", "under_review"].includes(
          e.record.getString("status")
        )
      if (hasPayment) p.requirePermission(e.app, u, "payments.update")
    }
  }
  return e.next()
})
onRecordUpdateRequest((e) => {
  if (e.hasSuperuserAuth()) return e.next()
  const p = require(`${__hooks}/lib/security-policy.js`)
  if (e.auth) {
    const u = p.freshUser(e.app, e.auth)
    const moduleName = p.collectionModules[e.collection.name]
    if (moduleName && u.getString("role") === "admin") {
      const operationModule =
        e.collection.name === "users" &&
        e.record.getString("role") === "expert" &&
        p.effective(e.app, u).includes("experts.update")
          ? "experts"
          : moduleName === "events"
            ? e.record.getString("lecture_id")
              ? "lectures"
              : "training"
            : moduleName
      p.requirePermission(e.app, u, operationModule + ".update")
      if (e.collection.name === "cases") {
        const before = e.app.findRecordById("cases", e.record.id)
        const moneyChanged = [
          "payment_amount",
          "is_paid",
          "payment_reject_reason",
          "payment_slip",
        ].some(
          (field) =>
            JSON.stringify(before.get(field)) !==
            JSON.stringify(e.record.get(field))
        )
        const paymentStatus =
          before.getString("status") !== e.record.getString("status") &&
          ["active", "awaiting_payment", "under_review"].includes(
            e.record.getString("status")
          )
        if (moneyChanged || paymentStatus)
          p.requirePermission(e.app, u, "payments.update")
      }
      if (moduleName === "events") {
        const old = e.app.findRecordById(e.collection.id, e.record.id)
        if (
          old.getString("lecture_id") !== e.record.getString("lecture_id") ||
          old.getString("program_id") !== e.record.getString("program_id")
        )
          throw new BadRequestError(
            "Event registration ownership cannot be changed."
          )
      }
    }
  }
  return e.next()
})
onRecordDeleteRequest((e) => {
  if (!e.hasSuperuserAuth() && e.auth) {
    const p = require(`${__hooks}/lib/security-policy.js`)
    const u = p.freshUser(e.app, e.auth)
    const moduleName = p.collectionModules[e.collection.name]
    if (moduleName && u.getString("role") === "admin") {
      const operationModule =
        e.collection.name === "users" &&
        e.record.getString("role") === "expert" &&
        p.effective(e.app, u).includes("experts.delete")
          ? "experts"
          : moduleName === "events"
            ? e.record.getString("lecture_id")
              ? "lectures"
              : "training"
            : moduleName
      p.requirePermission(e.app, u, operationModule + ".delete")
    }
  }
  return e.next()
})
onRecordEnrich((e) => {
  const auth = e.requestInfo ? e.requestInfo.auth : null
  if (
    auth &&
    auth.collection().name === "users" &&
    auth.getString("role") === "admin" &&
    e.record.collection().name === "cases"
  ) {
    const grants = auth.getStringSlice("security_permissions")
    if (!grants.includes("cases.read")) {
      const allowed = require(`${__hooks}/lib/security-payments.js`).fields
      for (const field of e.record.collection().fields)
        if (!allowed.includes(field.name)) e.record.hide(field.name)
    } else if (!grants.includes("payments.read")) {
      e.record.hide(
        "payment_amount",
        "is_paid",
        "payment_reject_reason",
        "payment_slip"
      )
    }
  }
  return e.next()
}, "cases")
onFileDownloadRequest((e) => {
  if (
    e.record &&
    e.record.collection().name === "cases" &&
    e.auth &&
    !e.hasSuperuserAuth()
  ) {
    const p = require(`${__hooks}/lib/security-policy.js`)
    const user = p.freshUser(e.app, e.auth)
    if (user.getString("role") === "admin")
      p.requirePermission(
        e.app,
        user,
        e.fileField && e.fileField.name === "payment_slip"
          ? "payments.read"
          : "cases.read"
      )
  }
  return e.next()
}, "cases")
// e.app is rebound so validation, write, invariant checks, and audit use the
// same SQLite transaction. This serializes competing privileged account edits.
onRecordCreateRequest((e) => {
  e.app.runInTransaction((app) => {
    e.app = app
    require(`${__hooks}/lib/security-management.js`).guardUserMutation(
      e,
      "create"
    )
  })
}, "users")
onRecordUpdateRequest((e) => {
  e.app.runInTransaction((app) => {
    e.app = app
    require(`${__hooks}/lib/security-management.js`).guardUserMutation(
      e,
      "update"
    )
  })
}, "users")
onRecordDeleteRequest((e) => {
  e.app.runInTransaction((app) => {
    e.app = app
    require(`${__hooks}/lib/security-management.js`).guardUserMutation(
      e,
      "delete"
    )
  })
}, "users")
// A client can remain connected after a role edit. Discard its SSE connection
// if the current auth status or compiled grants differ from its subscription.
onRealtimeMessageSend((e) => {
  const auth = e.client.get("auth")
  if (auth && auth.collection().name === "users") {
    try {
      const current = e.app.findRecordById("users", auth.id)
      if (
        !current.getBool("is_active") ||
        current.getString("role") !== auth.getString("role") ||
        JSON.stringify(current.getStringSlice("security_permissions")) !==
          JSON.stringify(auth.getStringSlice("security_permissions"))
      ) {
        e.client.discard()
        return
      }
    } catch {
      e.client.discard()
      return
    }
  }
  return e.next()
})
