module.exports = (e, action) => {
  const policy = require(__hooks + "/lib/security-policy.js"),
    u = policy.freshUser(e.app, e.auth)
  const role = u.getString("role"),
    grants = role === "admin" ? policy.effective(e.app, u) : []
  const permit = (key) =>
    role === "super_admin" || (role === "admin" && grants.includes(key))
  const dto = (r) => ({
    id: r.id,
    user: r.getString("user"),
    program_id: r.getString("program_id"),
    program_status: r.getString("program_status"),
    user_details: r.get("user_details"),
    created: r.getString("created"),
  })
  if (action === "list") {
    if (role === "admin" && !permit("training.read"))
      throw new ForbiddenError("Training read permission required")
    const q = e.request.url.query(),
      params = { owner: u.id },
      parts = ["portal_type = 'Attending Training'", "program_id != ''"]
    if (!permit("training.read")) parts.push("user = {:owner}")
    for (const key of ["program_id", "user"])
      if (q.get(key)) {
        params[key] = q.get(key)
        parts.push(key + " = {:" + key + "}")
      }
    const page = Math.max(1, Math.min(10000, Number(q.get("page")) || 1))
    return e.json(200, {
      items: e.app
        .findRecordsByFilter(
          "cases",
          parts.join(" && "),
          "-created",
          200,
          (page - 1) * 200,
          params
        )
        .map(dto),
    })
  }
  if (!permit("training." + (action === "delete" ? "delete" : "update")))
    throw new ForbiddenError("Training permission required")
  const r = e.app.findRecordById("cases", e.request.pathValue("id"))
  if (
    r.getString("portal_type") !== "Attending Training" ||
    !r.getString("program_id")
  )
    throw new NotFoundError("Enrollment not found")
  if (action === "delete") {
    e.app.delete(r)
    return e.noContent(204)
  }
  const b = e.requestInfo().body
  if (
    ![
      "registered",
      "enrolled",
      "attended",
      "absent",
      "completed",
      "cancelled",
    ].includes(b.status)
  )
    throw new BadRequestError("Invalid enrollment status")
  r.set("program_status", b.status === "registered" ? "enrolled" : b.status)
  e.app.save(r)
  return e.json(200, dto(r))
}
