const policy = require(`${__hooks}/lib/security-policy.js`)
const fields = [
  "id",
  "user",
  "name",
  "status",
  "is_paid",
  "payment_amount",
  "payment_slip",
  "payment_reject_reason",
  "created",
  "updated",
]
function data(record) {
  const row = { collectionId: record.collection().id, collectionName: "cases" }
  for (const field of fields) row[field] = record.get(field)
  return row
}
function list(e) {
  policy.requirePermission(e.app, e.auth, "payments.read")
  return e.app.findRecordsByFilter("cases", "", "-created", 0, 0).map(record => ({ ...data(record), owner_display: require(__hooks + "/lib/case-owner-display.js")(e.app, record) }))
}
function update(e) {
  const body = e.requestInfo().body
  let result
  e.app.runInTransaction((app) => {
    const actor = policy.requirePermission(app, e.auth, "payments.update")
    const record = app.findRecordById("cases", e.request.pathValue("id"))
    const before = data(record)
    switch (body.action) {
      case "set_amount":
        if (
          typeof body.amount !== "number" ||
          !Number.isFinite(body.amount) ||
          body.amount <= 0 ||
          body.amount > 1000000000
        )
          throw new BadRequestError("Enter a valid payment amount.")
        record.set("payment_amount", body.amount)
        record.set("status", "awaiting_payment")
        break
      case "approve":
        if (
          !["under_review", "awaiting_payment"].includes(
            record.getString("status")
          )
        )
          throw new BadRequestError(
            "This case is not awaiting payment approval."
          )
        record.set("status", "active")
        record.set("is_paid", true)
        record.set("payment_reject_reason", "")
        break
      case "reject":
        if (typeof body.reason !== "string" || body.reason.length > 2000)
          throw new BadRequestError("Invalid rejection reason.")
        record.set("status", "awaiting_payment")
        record.set("is_paid", false)
        record.set("payment_reject_reason", body.reason.trim())
        break
      default:
        throw new BadRequestError("Invalid payment action.")
    }
    app.save(record)
    result = { ...data(record), owner_display: require(__hooks + "/lib/case-owner-display.js")(app, record) }
    // Financial audit records omit names, uploads, and case notes.
    const safe = (row) => ({
      status: row.status,
      is_paid: row.is_paid,
      payment_amount: row.payment_amount,
    })
    policy.audit(
      app,
      actor,
      "payment." + body.action,
      "cases",
      record.id,
      safe(before),
      safe(result)
    )
  })
  return result
}
module.exports = { fields, data, list, update }
