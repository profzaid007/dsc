// Share safe role labels with registration; keep tool permissions private.
migrate((app) => {
  const roles = app.findCollectionByNameOrId("roles_management")
  for (const field of [
    new TextField({ name: "role_group" }),
    new NumberField({ name: "role_order", onlyInt: true }),
    new BoolField({ name: "is_retired" }),
  ]) {
    if (!roles.fields.getByName(field.name)) roles.fields.add(field)
  }
  app.save(roles)

  const profiles = app.findCollectionByNameOrId("expert_profiles")
  if (!profiles.fields.getByName("specialist_roles")) {
    profiles.fields.add(new RelationField({
      name: "specialist_roles", collectionId: roles.id, maxSelect: 100,
      cascadeDelete: false,
    }))
    app.save(profiles)
  }

  const name = "expert_roles_public"
  let view
  try { view = app.findCollectionByNameOrId(name) } catch { view = new Collection({ name, type: "view" }) }
  view.listRule = ""
  view.viewRule = ""
  view.viewQuery = "SELECT id, role_name_en, role_name_ar, role_group, role_order, is_retired FROM roles_management"
  app.save(view)
}, () => {
  throw new Error("Restore a reviewed backup to revert expert role selections.")
})
