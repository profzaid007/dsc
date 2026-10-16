function categoryByKey(app, key) {
  const records = app.findRecordsByFilter("specialist_role_categories", "key = {:key}", "", 1, 0, { key })
  return records[0]
}

module.exports = (e) => {
  const record = e.record
  const collection = record.collection().name
  if (collection === "specialist_role_categories") {
    const previousKey = record.original().getString("key")
    if (previousKey && previousKey !== record.getString("key")) throw new BadRequestError("Classification keys are fixed and cannot be changed")
    const key = record.getString("key")
    if (!/^[a-z0-9][a-z0-9_-]{0,199}$/.test(key)) throw new BadRequestError("Use a unique lowercase key with letters, numbers, hyphens or underscores")
    if (!record.getString("name_en").trim() || !record.getString("name_ar").trim()) throw new BadRequestError("English and Arabic classification names are required")
    const existing = categoryByKey(e.app, key)
    if (existing && existing.id !== record.id) throw new BadRequestError("The classification key already exists")
    if (key === "dsc-news") record.set("media_only", true)
    return
  }
  if (collection === "roles_management") {
    const categoryId = record.getString("category")
    const group = record.getString("role_group")
    if (group === "dsc-news") throw new BadRequestError("Media categories cannot contain specialist roles")
    const body = e.requestInfo().body
    if (group && Object.prototype.hasOwnProperty.call(body, "role_group") && !Object.prototype.hasOwnProperty.call(body, "category")) {
      const categories = e.app.findRecordsByFilter("specialist_role_categories", "key = {:key}", "", 1, 0, { key: group })
      if (!categories.length || categories[0].getBool("media_only")) throw new BadRequestError("Select a professional classification")
      record.set("category", categories[0].id)
    } else if (categoryId) {
      const category = e.app.findRecordById("specialist_role_categories", categoryId)
      if (category.getBool("media_only") || category.getString("key") === "dsc-news") throw new BadRequestError("Media categories cannot contain specialist roles")
      record.set("role_group", category.getString("key"))
    }
    return
  }
  const main = record.getString("main_category")
  const sub = record.getString(collection === "blog_pages" ? "category" : "subcategory")
  if (main && !categoryByKey(e.app, main)) throw new BadRequestError("Unknown main category")
  if (collection === "blog_categories") {
    const previous = record.original()
    const oldKey = previous.getString("key")
    if (oldKey && oldKey !== record.getString("key")) throw new BadRequestError("Subcategory keys are stable identifiers; edit the labels instead")
    if (previous.getString("main_category") && previous.getString("main_category") !== main) {
      // Moving a category would invalidate its existing article/event relationships.
      for (const name of ["blog_pages", "programs", "public_lectures"]) {
        const field = name === "blog_pages" ? "category" : "subcategory"
        if (e.app.findRecordsByFilter(name, field + " = {:key}", "", 1, 0, { key: record.getString("key") }).length) throw new BadRequestError("This subcategory is in use; keep its parent category")
      }
    }
    return
  }
  if (main && sub) {
    const matches = e.app.findRecordsByFilter("blog_categories", "key = {:key}", "", 1, 0, { key: sub })
    if (!matches.length || matches[0].getString("main_category") !== main) throw new BadRequestError("Subcategory must belong to the selected main category")
  }
}

module.exports.includeCategory = (app, key) => {
  for (const name of ["blog_categories", "blog_pages", "programs", "public_lectures"]) {
    const collection = app.findCollectionByNameOrId(name)
    const field = collection.fields.getByName("main_category")
    const type = typeof field.type === "function" ? field.type() : field.type
    if (type === "select" && !Array.from(field.values).includes(key)) {
      field.values = Array.from(field.values).concat([key])
      app.save(collection)
    }
  }
}
