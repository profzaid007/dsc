// Remove the unused test classification, not the shared lookups collection.
migrate((app) => {
  const records = app.findRecordsByFilter("lookups", 'type = "case_types"', "", 0, 0)
  for (const record of records) {
    if (record.getString("key") !== "case_test") {
      throw new Error("Unexpected case classification; stopped without deleting it: " + record.id)
    }
    const tools = app.findRecordsByFilter("case_tools", "type = {:id}", "", 1, 0, { id: record.id })
    const roles = app.findRecordsByFilter("roles_management", "tool_types ?= {:id}", "", 1, 0, { id: record.id })
    if (tools.length || roles.length) throw new Error("Case classification is referenced; deletion stopped")
  }
  for (const record of records) app.delete(record)
}, () => {
  // Restore the database backup if this unused classification is needed again.
})
