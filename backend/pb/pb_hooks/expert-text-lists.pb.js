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
