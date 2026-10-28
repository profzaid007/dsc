const clients = ["parent", "individual", "organization", "care_foundation"]
const staff = (u) => ["admin", "super_admin"].includes(u.getString("role"))
function allocation(app, caseId, expertId) {
  return (
    app.findRecordsByFilter(
      "case_experts",
      "case_id = {:caseId} && expert_id = {:expertId}",
      "",
      1,
      0,
      { caseId, expertId }
    ).length > 0
  )
}
function actor(app, auth, action) {
  const p = require(`${__hooks}/lib/security-policy.js`)
  const user = p.freshUser(app, auth)
  if (user.getString("role") === "admin")
    p.requirePermission(app, user, "messages." + action)
  return user
}
function caseAccess(app, user, caseId) {
  const c = app.findRecordById("cases", caseId)
  if (
    !staff(user) &&
    c.getString("user") !== user.id &&
    !(user.getString("role") === "expert" && allocation(app, c.id, user.id))
  )
    throw new ForbiddenError(
      "You can access messages only for your own or allocated cases. / الرسائل متاحة لحالاتك أو الحالات المخصصة لك فقط."
    )
  return c
}
function allowed(app, sender, recipient, caseId) {
  if (!recipient.getBool("is_active") || sender.id === recipient.id)
    return false
  if (
    recipient.getString("role") === "admin" &&
    !require(`${__hooks}/lib/security-policy.js`)
      .effective(app, recipient)
      .includes("messages.read")
  )
    return false
  if (!caseId)
    return (
      staff(sender) ||
      (sender.getString("role") === "expert" && staff(recipient)) ||
      (clients.includes(sender.getString("role")) && staff(recipient))
    )
  const c = caseAccess(app, sender, caseId)
  const owner = c.getString("user")
  const sr = sender.getString("role"),
    rr = recipient.getString("role")
  if (staff(sender))
    return (
      recipient.id === owner ||
      (rr === "expert" && allocation(app, c.id, recipient.id))
    )
  if (clients.includes(sr) && sender.id === owner)
    return (
      staff(recipient) ||
      (rr === "expert" && allocation(app, c.id, recipient.id))
    )
  if (sr === "expert" && allocation(app, c.id, sender.id))
    return staff(recipient) || (recipient.id === owner && clients.includes(rr))
  return false
}
function contacts(e) {
  const u = actor(e.app, e.auth, "read")
  const caseId = e.request.url.query().get("case_id")
  if (caseId) caseAccess(e.app, u, caseId)
  // Return only ids and display names of authorized recipients, never account emails.
  const users = e.app.findRecordsByFilter(
    "users",
    "is_active = true && id != {:self}",
    "name",
    0,
    0,
    { self: u.id }
  )
  const caseIds =
    !caseId && u.getString("role") === "expert"
      ? e.app
          .findRecordsByFilter("case_experts", "expert_id = {:id}", "", 0, 0, {
            id: u.id,
          })
          .map((r) => r.getString("case_id"))
      : []
  const owners = caseIds.map((id) =>
    e.app.findRecordById("cases", id).getString("user")
  )
  return users
    .filter(
      (r) => allowed(e.app, u, r, caseId) || (!caseId && owners.includes(r.id))
    )
    .map((r) => ({
      id: r.id,
      name: r.getString("name"),
      role: r.getString("role"),
    }))
}
function create(e) {
  const u = actor(e.app, e.auth, "create")
  const r = e.record
  if (r.getString("sender") !== u.id || r.getBool("read"))
    throw new ForbiddenError("Invalid message sender or read status.")
  const recipient = e.app.findRecordById("users", r.getString("recipient"))
  if (!allowed(e.app, u, recipient, r.getString("case")))
    throw new ForbiddenError(
      "Send messages only to the client of your allocated case, its allocated expert, or an administrator. / يمكنك مراسلة صاحب الحالة المخصصة لك أو الخبير المخصص للحالة أو الإدارة فقط."
    )
  r.set("subject", r.getString("subject").trim())
  r.set("body", r.getString("body").trim())
  if (!r.getString("body"))
    throw new BadRequestError("Enter a message. / أدخل نص الرسالة.")
}
function update(e) {
  const u = actor(e.app, e.auth, "update"),
    r = e.record,
    old = r.original()
  if (old.getString("recipient") !== u.id)
    throw new ForbiddenError("Only the recipient can mark a message as read.")
  if (old.getString("case")) caseAccess(e.app, u, old.getString("case"))
  const body = e.requestInfo().body
  if (
    Object.keys(body).some((k) => k !== "read") ||
    Object.keys(e.requestInfo().body).length === 0 ||
    r.getBool("read") !== true
  )
    throw new ForbiddenError(
      "Messages cannot be edited. Only marking a message as read is permitted."
    )
  // File uploads do not appear in requestInfo.body.
  for (const f of [
    "sender",
    "recipient",
    "case",
    "subject",
    "body",
    "attachments",
  ])
    if (JSON.stringify(r.get(f)) !== JSON.stringify(old.get(f)))
      throw new ForbiddenError(
        "Message contents and attachments cannot be changed."
      )
}
module.exports = { contacts, create, update }
