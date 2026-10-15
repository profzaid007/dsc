const catalog = require(`${__hooks}/lib/classification-catalog.js`)

module.exports = (e) => {
  const record = e.record
  const collection = record.collection().name
  if (collection === "specialist_role_categories") {
    const main = catalog.main.find(c => c.key === record.getString("key"))
    if (!main) throw new BadRequestError("The unified catalog has exactly seven main categories; add a subcategory instead")
    record.set("name_en", main.en)
    record.set("name_ar", main.ar)
    record.set("media_only", main.media_only)
    record.set("is_active", true)
    return
  }
  if (collection === "roles_management") {
    const categoryId = record.getString("category")
    const group = record.getString("role_group")
    if (group === "dsc-news") throw new BadRequestError("Media categories cannot contain specialist roles")
    const body = e.requestInfo().body
    if (group && Object.prototype.hasOwnProperty.call(body, "role_group") && !Object.prototype.hasOwnProperty.call(body, "category")) {
      const categories = e.app.findRecordsByFilter("specialist_role_categories", "key = {:key}", "", 1, 0, { key: group })
      if (categories.length) record.set("category", categories[0].id)
    } else if (categoryId) {
      const category = e.app.findRecordById("specialist_role_categories", categoryId)
      if (category.getBool("media_only") || category.getString("key") === "dsc-news") throw new BadRequestError("Media categories cannot contain specialist roles")
      if (catalog.main.some(c => c.key === category.getString("key"))) record.set("role_group", category.getString("key"))
    }
    return
  }
  const main = record.getString("main_category")
  const sub = record.getString(collection === "blog_pages" ? "category" : "subcategory")
  if (main && !catalog.main.some(c => c.key === main)) throw new BadRequestError("Unknown main category")
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
