// Preserve field types and existing data, expanding the enum from saved categories.
migrate((app) => {
  const keys = app.findRecordsByFilter("specialist_role_categories", "", "", 0, 0).map(record => record.getString("key"))
  for (const name of ["blog_categories", "blog_pages", "programs", "public_lectures"]) {
    const collection = app.findCollectionByNameOrId(name)
    const field = collection.fields.getByName("main_category")
    if (!field) throw new Error("Apply the unified classification migrations first")
    const type = typeof field.type === "function" ? field.type() : field.type
    if (type === "text") continue
    if (type !== "select") throw new Error("Unexpected classification storage type")
    field.values = Array.from(new Set(Array.from(field.values).concat(keys)))
    app.save(collection)
  }
  const categories = app.findCollectionByNameOrId("specialist_role_categories")
  const active = '@request.auth.id != "" && @request.auth.is_active = true'
  for (const action of ["create", "update", "delete"]) {
    categories[action + "Rule"] = active + ' && (@request.auth.role = "super_admin" || @request.auth.security_permissions:each ?= "settings.' + action + '")'
  }
  app.save(categories)
}, () => {
  // Retain options and permission rules to preserve administrator-created categories.
})
