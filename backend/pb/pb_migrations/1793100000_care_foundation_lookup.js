// The account type already exists; expose its label in the user-type lookup.
migrate((app) => {
  const existing = app.findRecordsByFilter(
    "lookups",
    'type = "user_types" && key = "care_foundation"',
    "", 1, 0
  )
  if (existing.length) return
  const record = new Record(app.findCollectionByNameOrId("lookups"))
  record.set("type", "user_types")
  record.set("key", "care_foundation")
  record.set("label_en", "Care Foundation")
  record.set("label_ar", "مؤسسة رعاية")
  app.save(record)
}, () => {
  // Retain the lookup on rollback: existing accounts may use this key.
})
