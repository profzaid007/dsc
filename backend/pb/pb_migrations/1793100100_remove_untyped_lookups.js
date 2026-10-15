// Replace references before removing legacy lookup rows. Typed rows are retained.
migrate((app) => {
  const legacy = app.findRecordsByFilter("lookups", 'type = ""', "", 0, 0)
  const toolKeys = ["survey", "multiple_answer", "media_question", "report", "plan", "attachment_request", "one_to_one_meeting"]
  const userKeys = ["parent", "individual", "organization", "expert", "care_foundation"]
  const replacements = legacy.map((record) => {
    const key = record.getString("key")
    const group = toolKeys.includes(key) ? "tool_types" : userKeys.includes(key) ? "user_types" : ""
    if (!group) throw new Error("Unrecognized untyped lookup; stopped: " + record.id)
    const matches = app.findRecordsByFilter("lookups", "type = {:type} && key = {:key}", "", 2, 0, { type: group, key })
    if (matches.length !== 1) throw new Error("Expected one classified replacement for " + key)
    return { record, replacement: matches[0] }
  })
  for (const { record, replacement } of replacements) {
    const tools = app.findRecordsByFilter("case_tools", "type = {:id}", "", 0, 0, { id: record.id })
    for (const tool of tools) {
      tool.set("type", replacement.id)
      app.save(tool)
    }
    const roles = app.findRecordsByFilter("roles_management", "tool_types ?= {:id}", "", 0, 0, { id: record.id })
    for (const role of roles) {
      const ids = role.getStringSlice("tool_types").map((id) => id === record.id ? replacement.id : id)
      role.set("tool_types", [...new Set(ids)])
      app.save(role)
    }
    app.delete(record)
  }
}, () => {
  // Restore the pre-migration database backup if the legacy rows are needed.
})
