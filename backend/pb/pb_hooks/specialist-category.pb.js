const validateRoleCategory = e => {
  const categoryId = e.record.getString("category")
  if (!categoryId) throw new BadRequestError("Select a professional classification")
  const category = e.app.findRecordById("specialist_role_categories", categoryId)
  if (category.getBool("media_only") || ["psychology", "dsc-news"].includes(category.getString("key")))
    throw new BadRequestError("Select a professional classification")
  return e.next()
}
onRecordCreate(validateRoleCategory, "roles_management")
onRecordUpdate(validateRoleCategory, "roles_management")
