// Care foundations have entity profiles and own child cases through cases.user.
// Existing case, assignment and task rules already scope access by that owner.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  const role = users.fields.getByName("role")
  if (!role.values.includes("care_foundation")) {
    role.values = [...role.values, "care_foundation"]
    app.save(users)
  }

  const portals = app.findCollectionByNameOrId("portals")
  const registrationType = portals.fields.getByName("registration_type")
  if (!registrationType.values.includes("care_foundation")) {
    registrationType.values = [...registrationType.values, "care_foundation"]
    app.save(portals)
  }

  const lookups = app.findCollectionByNameOrId("lookups")
  const existing = app.findRecordsByFilter(
    lookups.name, 'type = "user_types" && key = "care_foundation"', "", 1, 0
  )
  if (!existing.length) {
    const record = new Record(lookups)
    record.set("type", "user_types")
    record.set("key", "care_foundation")
    record.set("label_en", "Care Foundation")
    record.set("label_ar", "مؤسسة الرعاية")
    app.save(record)
  }
}, () => {
  throw new Error("Restore a reviewed backup to revert care foundation accounts.")
})
