// Only current specialist-role relations identify an allocation.
migrate(app => {
  const collection = app.findCollectionByNameOrId("case_experts")
  const roleField = collection.fields.getByName("role_id")
  if (!roleField) throw new Error("case_experts.role_id is required for migration.")
  const valid = new Set(app.findAllRecords("roles_management").map(r => r.id))
  let removed = 0
  for (const allocation of app.findAllRecords("case_experts")) {
    if (!valid.has(allocation.getString("role_id"))) {
      app.delete(allocation)
      removed++
    }
  }
  const legacy = collection.fields.getByName("role")
  if (legacy) collection.fields.removeById(legacy.id)
  roleField.required = true
  app.save(collection)
  console.log("Allocation role migration: removed " + removed + " unmatched allocations.")
}, () => {
  throw new Error("Restore the pre-migration backup to recover removed allocations.")
})
