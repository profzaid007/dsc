// PocketBase does not support the :changed request modifier. Deny any direct
// permission-field submission; authorized grants use the security API instead.
migrate(app => {
  const users = app.findCollectionByNameOrId("users")
  if (users.updateRule == null) return
  const prior = String(users.updateRule)
  const fixed = prior.replace(/@request\.body\.security_permissions:changed\s*=\s*false\b/g, "@request.body.security_permissions:isset = false")
  if (fixed !== prior) { users.updateRule = fixed; app.save(users) }
}, () => { throw new Error("Restore a reviewed backup; do not restore an unsupported permission rule") })
