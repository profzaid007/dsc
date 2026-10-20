routerAdd(
  "GET",
  "/api/dsc/assessment-session-counts",
  (e) => {
    const policy = require(__hooks + "/lib/security-policy.js")
    const u = policy.freshUser(e.app, e.auth),
      role = u.getString("role")
    const all =
      role === "super_admin" ||
      (role === "admin" &&
        policy.effective(e.app, u).includes("assignments.read"))
    if (!all && role !== "expert")
      throw new ForbiddenError("Assignment read permission required")
    const allowed = all
      ? null
      : e.app
          .findRecordsByFilter("case_experts", "expert_id = {:id}", "", 0, 0, {
            id: u.id,
          })
          .map((r) => r.getString("case_id"))
    const groups = {}
    for (const s of e.app.findAllRecords("assessment_sessions")) {
      const id = s.getString("case"),
        status = s.getString("status")
      if (e.request.url.query().get("pending") === "1" && status !== "assigned")
        continue
      if (allowed && !allowed.includes(id)) continue
      const key = id + ":" + status
      if (!groups[key]) groups[key] = { case: id, status, count: 0 }
      groups[key].count++
    }
    const items = Object.values(groups)
    return e.json(200, {
      items,
      totalItems: items.reduce((n, r) => n + r.count, 0),
    })
  },
  $apis.requireAuth("users")
)
