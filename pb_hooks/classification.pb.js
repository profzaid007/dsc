onRecordCreateRequest((e) => {
  const validation = require(`${__hooks}/lib/classification-validation.js`)
  validation(e)
  if (e.record.collection().name === "specialist_role_categories") validation.includeCategory(e.app, e.record.getString("key"))
  return e.next()
}, "roles_management", "blog_categories", "blog_pages", "programs", "public_lectures", "specialist_role_categories")

onRecordUpdateRequest((e) => {
  require(`${__hooks}/lib/classification-validation.js`)(e)
  return e.next()
}, "roles_management", "blog_categories", "blog_pages", "programs", "public_lectures", "specialist_role_categories")

onRecordDelete((e) => {
  const key = e.record.getString("key")
  if (e.app.findRecordsByFilter("roles_management", "category = {:id} || role_group = {:key}", "", 1, 0, { id: e.record.id, key }).length) throw new BadRequestError("This classification contains roles; move them before deletion")
  for (const name of ["blog_categories", "blog_pages", "programs", "public_lectures"]) {
    if (e.app.findRecordsByFilter(name, "main_category = {:key}", "", 1, 0, { key }).length) throw new BadRequestError("This classification is used by content; move the linked content before deletion")
  }
  return e.next()
}, "specialist_role_categories")

onRecordDelete((e) => {
  for (const name of ["blog_pages", "programs", "public_lectures"]) {
    const field = name === "blog_pages" ? "category" : "subcategory"
    if (e.app.findRecordsByFilter(name, field + " = {:key}", "", 1, 0, { key: e.record.getString("key") }).length) throw new BadRequestError("This subcategory is in use and cannot be deleted")
  }
  return e.next()
}, "blog_categories")
