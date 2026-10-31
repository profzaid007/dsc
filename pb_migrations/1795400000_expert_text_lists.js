// Normalize valid JSON string lists without changing any other profile fields.
migrate(app => {
  let converted = 0
  for (const profile of app.findAllRecords("expert_profiles")) {
    for (const field of ["age_group", "specialization_type"]) {
      const raw = profile.getString(field)
      if (!/^\s*[\[{]/.test(raw)) continue
      const values = JSON.parse(raw)
      if (!Array.isArray(values) || values.some(value =>
        typeof value !== "string" || value.includes(",")
      )) throw new Error("Manual review required: " + profile.id + "." + field)
      const value = values.map(item => item.trim()).filter(Boolean).join(", ")
      // Column names come only from the fixed list above; record data is bound.
      app.db().newQuery("UPDATE expert_profiles SET " + field + " = {:value} WHERE id = {:id}")
        .bind({ value, id: profile.id }).execute()
      converted++
    }
  }
  console.log("Normalized expert text-list fields: " + converted)
}, () => {
  throw new Error("Restore the pre-migration backup to recover the original formatting.")
})
