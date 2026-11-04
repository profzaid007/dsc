migrate(app => {
  const c = app.findCollectionByNameOrId("expert_profiles")
  const age = c.fields.getByName("age_group")
  if (!age) throw new Error("Expert age_group field is missing")
  if (age.type() !== "text") {
    const values = app.findAllRecords("expert_profiles").map(record => {
      const raw = record.getString("age_group")
      const items = raw && raw !== "null" ? JSON.parse(raw) : []
      if (!Array.isArray(items) || items.some(item => typeof item !== "string" || !item.trim() || item.includes(",")))
        throw new Error("Correct age groups before conversion: " + record.id)
      return {id:record.id,text:items.join(", ")}
    })
    c.fields.removeByName("age_group")
    app.save(c)
    c.fields.add(new TextField({name:"age_group",max:5000}))
    app.save(c)
    for (const item of values) {
      const record = app.findRecordById("expert_profiles", item.id)
      record.set("age_group", item.text)
      app.save(record)
    }
  }
  if (!c.fields.getByName("submission_key")) {
    c.fields.add(new TextField({name:"submission_key",max:64,hidden:true}))
    app.save(c)
  }
}, () => { throw new Error("Restore the local registration backup to revert the schema correction") })
