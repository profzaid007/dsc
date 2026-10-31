function upgradeRoleAssignment(app, policy) {
  const users = app.findCollectionByNameOrId("users")
  const projection = users.fields.getByName("security_permissions")
  projection.values = policy.catalog.map((p) => p.key)
  projection.maxSelect = policy.catalog.length
  app.save(users)

  const permissionCollection = app.findCollectionByNameOrId(
    "security_permissions"
  )
  let administrator
  try {
    administrator = app.findFirstRecordByFilter(
      "security_roles",
      'key = "administrator"'
    )
  } catch {}
  for (const item of policy.catalog.filter((p) => p.module === "security")) {
    let permission
    try {
      permission = app.findFirstRecordByFilter(
        "security_permissions",
        "key = {:key}",
        { key: item.key }
      )
    } catch {}
    if (!permission) permission = new Record(permissionCollection)
    for (const key of Object.keys(item)) permission.set(key, item[key])
    app.save(permission)
    if (administrator && administrator.getBool("is_system")) {
      const existing = app.findRecordsByFilter(
        "security_role_permissions",
        "role = {:role} && permission = {:permission}",
        "",
        1,
        0,
        { role: administrator.id, permission: permission.id }
      )
      if (!existing.length) {
        const grant = new Record(
          app.findCollectionByNameOrId("security_role_permissions")
        )
        grant.set("role", administrator.id)
        grant.set("permission", permission.id)
        app.save(grant)
      }
    }
  }
  // Remove only account-type gates attached to explicit permission checks.
  // Ownership, allocation, active-account and Super Admin rules are preserved.
  for (const collection of app.findAllCollections()) {
    if (collection.type === "view") continue
    let changed = false
    for (const field of [
      "listRule",
      "viewRule",
      "createRule",
      "updateRule",
      "deleteRule",
    ]) {
      const rule = collection[field]
      if (typeof rule !== "string") continue
      const updated = rule.replace(
        /@request\.auth\.role\s*=\s*["']admin["']\s*&&\s*(?=@request\.auth\.security_permissions:each)/g,
        "@request.auth.is_active = true && "
      )
      if (rule !== updated) {
        collection[field] = updated
        changed = true
      }
    }
    if (changed) app.save(collection)
  }
  for (const user of app.findRecordsByFilter("users", "", "", 0, 0))
    policy.compile(app, user.id)
}
module.exports = upgradeRoleAssignment
