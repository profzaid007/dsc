onRecordCreateRequest((e) => {
  require(`${__hooks}/lib/classification-validation.js`)(e)
  return e.next()
}, "roles_management", "blog_categories", "blog_pages", "programs", "public_lectures", "specialist_role_categories")

onRecordUpdateRequest((e) => {
  require(`${__hooks}/lib/classification-validation.js`)(e)
  return e.next()
}, "roles_management", "blog_categories", "blog_pages", "programs", "public_lectures", "specialist_role_categories")

onRecordDelete((e) => {
  const catalog = require(`${__hooks}/lib/classification-catalog.js`)
  if (catalog.main.some(c => c.key === e.record.getString("key"))) throw new BadRequestError("Unified main categories cannot be deleted")
  return e.next()
}, "specialist_role_categories")

onRecordDelete((e) => {
  for (const name of ["blog_pages", "programs", "public_lectures"]) {
    const field = name === "blog_pages" ? "category" : "subcategory"
    if (e.app.findRecordsByFilter(name, field + " = {:key}", "", 1, 0, { key: e.record.getString("key") }).length) throw new BadRequestError("This subcategory is in use and cannot be deleted")
  }
  return e.next()
}, "blog_categories")
