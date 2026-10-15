// Add the requested professional categories without replacing legacy record IDs.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("specialist_role_categories")
  const categories = app.findRecordsByFilter(collection.id, "", "", 0, 0)
  const additions = [
    { key: "research", en: "Research & Statistical Analysis", ar: "البحث العلمي والتحليل الإحصائي", order: 4 },
    { key: "other", en: "Other", ar: "أخرى", order: 6 },
  ]
  for (const addition of additions) {
    const exact = categories.find(c => c.getString("key") === addition.key)
    const legacy = addition.key === "other" ? categories.find(c => c.getString("name_ar").trim() === "أخرى" || c.getString("name_en").trim().toLowerCase() === "other") : null
    const record = exact || legacy || new Record(collection)
    record.set("key", addition.key)
    record.set("name_en", addition.en)
    record.set("name_ar", addition.ar)
    record.set("is_active", true)
    record.set("media_only", false)
    record.set("order", addition.order)
    app.save(record)
    const roles = app.findRecordsByFilter("roles_management", "category = {:id}", "", 0, 0, { id: record.id })
    for (const role of roles) {
      role.set("role_group", addition.key)
      app.save(role)
    }
  }
  // Keep media last, outside the seven professional categories.
  for (const category of categories) {
    if (category.getString("key") === "dsc-news") { category.set("order", 7); app.save(category) }
  }
  for (const name of ["blog_categories", "blog_pages", "programs", "public_lectures"]) {
    const c = app.findCollectionByNameOrId(name)
    const field = c.fields.getByName("main_category")
    if (!field) throw new Error("Apply the unified classification migration first")
    const values = Array.from(field.values)
    if (!values.includes("other")) { field.values = values.concat(["other"]); app.save(c) }
  }
}, () => {
  // Keep IDs and classifications intact; restore a reviewed backup if needed.
})
