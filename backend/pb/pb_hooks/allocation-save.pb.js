routerAdd(
  "POST",
  "/api/dsc/cases/{caseId}/allocations",
  (e) => {
    const policy = require(`${__hooks}/lib/security-policy.js`)
    policy.requirePermission(e.app,e.auth,"allocations.read")
    const caseId = e.request.pathValue("caseId")
    e.app.findRecordById("cases", caseId)
    const rows = e.requestInfo().body.rows
    if (!Array.isArray(rows) || rows.length > 100)
      throw new BadRequestError("Invalid allocation list.")
    const seen = {}
    for (const row of rows) {
      if (
        !row ||
        typeof row.expert_id !== "string" ||
        (typeof row.role_id !== "string" || !row.role_id.trim())
      )
        throw new BadRequestError("Select an expert and role.")
      const expert = e.app.findRecordById("users", row.expert_id)
      if (expert.getString("role") !== "expert" || !expert.getBool("is_active"))
        throw new BadRequestError("Select active experts.")
      const specialist = e.app.findRecordById("roles_management", row.role_id)
      row.role_id = specialist.id
      const key = row.expert_id + ":" + row.role_id
      if (seen[key]) throw new BadRequestError("Duplicate expert and role.")
      seen[key] = true
    }
    e.app.runInTransaction((app) => {
      policy.requirePermission(app,e.auth,"allocations.read")
      const existing = app.findRecordsByFilter(
        "case_experts",
        "case_id = {:id}",
        "",
        0,
        0,
        { id: caseId }
      )
      const rowIds = {}
      for (const row of rows) {
        if (row.id && rowIds[row.id]) throw new BadRequestError("Duplicate allocation ID.")
        if (row.id) rowIds[row.id] = true
        if (row.id && !existing.some((r) => r.id === row.id))
          throw new BadRequestError("Allocation does not belong to this case.")
      }
      for (const record of existing) {
        if (!rows.some((row) => row.id === record.id)) {
          policy.requirePermission(app,e.auth,"allocations.delete")
          app.delete(record)
        }
      }
      const collection = app.findCollectionByNameOrId("case_experts")
      for (const row of rows) {
        const record = row.id
          ? existing.find((r) => r.id === row.id)
          : new Record(collection)
        if (row.id && record.getString("expert_id") === row.expert_id && record.getString("role_id") === row.role_id) continue
        policy.requirePermission(app,e.auth,row.id ? "allocations.update" : "allocations.create")
        record.set("case_id", caseId)
        record.set("expert_id", row.expert_id)
        record.set("role", row.role)
        record.set("role_id", row.role_id)
        app.save(record)
      }
    })
    return e.json(200, { success: true })
  },
  $apis.requireAuth("users")
)
