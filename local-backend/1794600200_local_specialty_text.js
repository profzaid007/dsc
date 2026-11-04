// Explicit one-time conversion of the five confirmed local specialty records.
migrate(app => {
  const profiles = app.findCollectionByNameOrId("expert_profiles")
  const expected = ["lh3fg2swvcapzr0", "ysjd4je808fbe5i", "133uc3vnpxxe8u9", "zk20mswd8m64iq0", "tamivw9n76k3w9o"]
  const records = app.findAllRecords("expert_profiles")
  if (records.length !== expected.length || records.some(r => !expected.includes(r.id)))
    throw new Error("Local expert records changed; review the conversion scope")
  const values = records.map(record => {
    const items = JSON.parse(record.getString("specialization_type") || "[]")
    if (!Array.isArray(items) || items.some(item => typeof item !== "string" || !item.trim() || item.includes(",")))
      throw new Error("Cannot convert specialty list without loss: " + record.id)
    return {id:record.id,text:items.join(", ")}
  })
  const view = app.findCollectionByNameOrId("experts_public")
  const query = view.viewQuery
  // Remove the SQL dependency only within this migration transaction.
  const temporaryQuery = query.replace(/expert_profiles\.specialization_type/g, "'' AS specialization_type")
  if (temporaryQuery === query) throw new Error("Review the public expert view before field replacement")
  view.viewQuery = temporaryQuery
  app.save(view)
  profiles.fields.removeByName("specialization_type")
  app.save(profiles)
  profiles.fields.add(new TextField({name:"specialization_type",max:5000}))
  app.save(profiles)
  for (const value of values) {
    const record = app.findRecordById("expert_profiles", value.id)
    record.set("specialization_type", value.text)
    app.save(record)
  }
  view.viewQuery = query
  app.save(view)
}, () => { throw new Error("Restore the conversion backup to undo this local data correction") })
