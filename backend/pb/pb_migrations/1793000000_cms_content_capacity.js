// Additive capacity increase: keep existing field IDs, content and access rules.
// PocketBase text max=0 means 5,000 characters, not an unlimited text field.
migrate((app) => {
  for (const name of ["home_pages", "info_pages", "blog_pages"]) {
    const collection = app.findCollectionByNameOrId(name)
    let changed = false
    for (const fieldName of ["content_en", "content_ar"]) {
      const field = collection.fields.getByName(fieldName)
      if (!field) throw new Error(name + "." + fieldName + " is missing")
      const type = typeof field.type === "function" ? field.type() : field.type
      // Existing editor fields already default to ~5MB; retain their configuration.
      if (type === "editor") continue
      if (type !== "text") throw new Error(name + "." + fieldName + " must be a text or editor field")
      if (!field.max || field.max < 1000000) {
        field.max = 1000000
        changed = true
      }
    }
    if (changed) app.save(collection)
  }
}, () => {
  // Deliberately retain capacity on rollback: reducing it can make existing
  // saved layouts uneditable. Restore reviewed schema limits separately if needed.
})
