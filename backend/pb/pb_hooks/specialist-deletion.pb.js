onRecordDeleteRequest((e) => {
  const used = (name, field, value, operator) => {
    const collection = e.app.findCollectionByNameOrId(name)
    if (!collection.fields.getByName(field)) return false
    return e.app.findRecordsByFilter(
      name, field + " " + operator + " {:value}", "", 1, 0, { value }
    ).length > 0
  }
  if (e.record.collection().name === "specialist_role_categories") {
    if (used("roles_management", "category", e.record.id, "=")) {
      throw new BadRequestError("This category contains roles. Move them or delete unused roles first.")
    }
  } else if (
    used("expert_profiles", "specialist_roles", e.record.id, "?=") ||
    used("case_experts", "role_id", e.record.id, "=") ||
    used("case_experts", "role", e.record.getString("role_name_en"), "=")
  ) {
    throw new BadRequestError("This role is used by experts or case assignments. Deactivate it instead.")
  }
  return e.next()
}, "specialist_role_categories", "roles_management")
