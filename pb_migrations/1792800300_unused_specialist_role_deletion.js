migrate((app) => {
  const roles = app.findCollectionByNameOrId("roles_management")
  // Reverse relations keep linked profiles/assignments protected at the API,
  // even before the optional request hook is deployed.
  const profiles = app.findCollectionByNameOrId("expert_profiles")
  const assignments = app.findCollectionByNameOrId("case_experts")
  if (!profiles.fields.getByName("specialist_roles") || !assignments.fields.getByName("role_id")) {
    throw new Error("Apply the canonical expert role relations before enabling role deletion.")
  }
  roles.deleteRule = '@request.auth.id != "" && @request.auth.is_active = true && (@request.auth.role = "admin" || @request.auth.role = "super_admin") && case_experts_via_role_id.id = "" && expert_profiles_via_specialist_roles.id = ""'
  app.save(roles)
}, (app) => {
  const roles = app.findCollectionByNameOrId("roles_management")
  roles.deleteRule = null
  app.save(roles)
})
