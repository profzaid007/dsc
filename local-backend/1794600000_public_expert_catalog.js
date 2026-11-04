migrate(app => {
  const roles = app.findCollectionByNameOrId("roles_management")
  for (const name of ["role_name_en", "role_name_ar", "role_group", "role_order", "is_retired"]) {
    if (!roles.fields.getByName(name)) throw new Error("Correct the roles_management schema: missing " + name)
  }
  const profiles = app.findCollectionByNameOrId("expert_profiles")
  if (!profiles.fields.getByName("specialist_roles")) {
    profiles.fields.add(new RelationField({name:"specialist_roles",collectionId:roles.id,maxSelect:100,cascadeDelete:false}))
    app.save(profiles)
  }
  let view
  try { view = app.findCollectionByNameOrId("expert_roles_public") }
  catch { view = new Collection({name:"expert_roles_public",type:"view"}) }
  view.listRule = ""
  view.viewRule = ""
  view.viewQuery = "SELECT id, role_name_en, role_name_ar, role_group, role_order, is_retired FROM roles_management"
  app.save(view)
  const experts = app.findCollectionByNameOrId("experts_public")
  if (!experts.fields.getByName("specialist_roles")) {
    const query = experts.viewQuery.replace(/\bFROM\s+expert_profiles\b/i, ", expert_profiles.specialist_roles FROM expert_profiles")
    if (query === experts.viewQuery) throw new Error("Review the experts_public view before adding specialist_roles")
    experts.viewQuery = query
    app.save(experts)
  }
}, () => { throw new Error("Restore the local backend backup to revert this catalog repair") })
