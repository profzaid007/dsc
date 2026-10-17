// Remove only failed inactive expert accounts with no profile and no operational references.
migrate(app => {
  const users = app.findCollectionByNameOrId("users")
  const collections = app.findAllCollections()
  const candidates = app.findRecordsByFilter("users", 'role = "expert" && is_active = false', "", 0, 0)
  let deleted = 0
  let retained = 0
  for (const user of candidates) {
    if (app.findRecordsByFilter("expert_profiles", "user = {:id}", "", 1, 0, {id:user.id}).length) continue
    let referenced = false
    for (const collection of collections) {
      if (collection.type === "view" || collection.name === "expert_bank_details") continue
      for (const field of collection.fields) {
        const type = typeof field.type === "function" ? field.type() : field.type
        if (type === "relation" && field.collectionId === users.id && app.findRecordsByFilter(collection.name, field.name + " ?= {:id}", "", 1, 0, {id:user.id}).length) referenced = true
      }
    }
    if (referenced) { retained++; continue }
    // IBAN rows were written by the earlier partial registration flow.
    const bankCollection = collections.find(c => c.name === "expert_bank_details")
    if (bankCollection) for (const bank of app.findRecordsByFilter(bankCollection.name, "user = {:id}", "", 0, 0, {id:user.id})) app.delete(bank)
    app.delete(user)
    deleted++
  }
  console.log("Incomplete expert attempts removed: " + deleted + "; retained because linked to operational records: " + retained)
}, () => {
  // Restore deleted attempts only from the deployment database backup if needed.
})
