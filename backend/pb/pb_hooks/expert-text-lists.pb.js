const validateExpertTextLists = e => {
  for (const field of ["age_group", "specialization_type", "preferred_languages", "client_type"]) {
    const value = e.record.get(field)
    if (value != null && (typeof value !== "string" || /^\s*[\[{]/.test(value)))
      throw new BadRequestError("Expert field " + field + " requires comma-separated text.")
  }
  return e.next()
}
onRecordCreate(validateExpertTextLists, "expert_profiles")
onRecordUpdate(validateExpertTextLists, "expert_profiles")

const validateRoleCategory = e => {
  const group = e.record.getString("role_group").trim()
  if (!group || ["psychology", "dsc-news"].includes(group))
    throw new BadRequestError("Correct this role's professional category before saving.")
  e.app.findFirstRecordByFilter("specialist_role_categories", "key = {:key}", {key:group})
  return e.next()
}
onRecordCreate(validateRoleCategory, "roles_management")
onRecordUpdate(validateRoleCategory, "roles_management")
