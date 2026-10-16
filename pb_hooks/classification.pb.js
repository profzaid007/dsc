onRecordCreateRequest((e) => {
  if (e.record.collection().name === "specialist_role_categories") throw new BadRequestError("The classification list is fixed; additions are not allowed")
  require(`${__hooks}/lib/classification-validation.js`)(e)
  return e.next()
}, "roles_management", "blog_categories", "blog_pages", "programs", "public_lectures", "specialist_role_categories")

onRecordUpdateRequest((e) => {
  require(`${__hooks}/lib/classification-validation.js`)(e)
  return e.next()
}, "roles_management", "blog_categories", "blog_pages", "programs", "public_lectures", "specialist_role_categories")

onRecordDelete((e) => {
  throw new BadRequestError("The classification list is fixed; deletions are not allowed")
}, "specialist_role_categories")

onRecordDelete((e) => {
  for (const name of ["blog_pages", "programs", "public_lectures"]) {
    const field = name === "blog_pages" ? "category" : "subcategory"
    if (e.app.findRecordsByFilter(name, field + " = {:key}", "", 1, 0, { key: e.record.getString("key") }).length) throw new BadRequestError("This subcategory is in use and cannot be deleted")
  }
  return e.next()
}, "blog_categories")
