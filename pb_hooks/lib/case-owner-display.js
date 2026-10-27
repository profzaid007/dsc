module.exports = (app, record) => {
  if (!record.getString("user")) return null
  const owner = app.findRecordById("users", record.getString("user"))
  const role = owner.getString("role")
  if (role === "parent") return { type: "parent", name: owner.getString("name") }
  if (role === "care_foundation") {
    const profiles = app.findRecordsByFilter("organization_profiles", "user = {:user}", "", 1, 0, { user: owner.id })
    return { type: "care_foundation", name: profiles.length ? profiles[0].getString("organization_name") : "" }
  }
  return null
}
