migrate(app => {
  const profiles = app.findCollectionByNameOrId("expert_profiles")
  const issues = []
  for (const role of app.findAllRecords("roles_management")) {
    const group = role.getString("role_group").trim()
    if (!group || ["psychology", "dsc-news"].includes(group)) issues.push("roles_management/" + role.id + ":role_group")
  }
  for (const record of app.findAllRecords("expert_profiles")) {
    for (const field of ["age_group", "specialization_type", "preferred_languages", "client_type"]) {
      const value = record.get(field)
      if (value != null && value !== "" && (typeof value !== "string" || /^\s*[\[{]/.test(value)))
        issues.push("expert_profiles/" + record.id + ":" + field)
    }
  }
  if (issues.length) throw new Error("Correct these records to use explicit categories and comma-separated text before deployment: " + issues.join(", "))
  const age = profiles.fields.getByName("age_group")
  if (age && age.type() !== "text") {
    const savedAges = app.findAllRecords("expert_profiles").map(record => ({id:record.id,value:record.get("age_group") || ""}))
    profiles.fields.removeByName("age_group")
    app.save(profiles)
    profiles.fields.add(new TextField({name:"age_group",max:5000}))
    app.save(profiles)
    for (const item of savedAges) {
      const record = app.findRecordById("expert_profiles", item.id)
      record.set("age_group", item.value)
      app.save(record)
    }
  }
  for (const record of app.findAllRecords("cases")) {
    if (!record.getString("status").trim()) {
      record.set("status", "awaiting_payment")
      record.set("is_paid", false)
      app.save(record)
    }
  }
}, () => { throw new Error("Restore a reviewed backup to revert the strict profile contract.") })
