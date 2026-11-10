const clientRoles = ["parent", "individual", "organization", "care_foundation"]
const taskFields = ["case", "type", "name_ar", "name_en", "config", "task_brief", "is_visible_to_user"]
const sessionFields = ["case", "recipient", "assessment", "assigned_at", "snapshot", "population"]

function recordNotification(e, created) {
  const record = e.record
  const task = record.collection().name === "case_tools"
  if (task ? !record.getBool("is_visible_to_user") : !record.getString("recipient")) return

  const previous = record.original()
  const fields = task ? taskFields : sessionFields
  const changed = field => record.getString(field) !== previous.getString(field)
  const attachmentEdit = task && changed("media") && !changed("responses") && !changed("status")
  if (!created && !fields.some(changed) && !attachmentEdit) return

  const caseRecord = e.app.findRecordById("cases", record.getString("case"))
  const recipient = caseRecord.getString("user")
  if (!recipient || (!task && recipient !== record.getString("recipient"))) return
  const owner = e.app.findRecordById("users", recipient)
  if (!clientRoles.includes(owner.getString("role"))) return

  const added = created || previous.getString("case") !== caseRecord.id ||
    (task ? !previous.getBool("is_visible_to_user") : previous.getString("recipient") !== recipient)
  const assessmentName = task ? "" :
    e.app.findRecordById("assessments", record.getString("assessment")).getString("name")
  const notification = new Record(e.app.findCollectionByNameOrId("assignment_notifications"), {
    recipient,
    case: caseRecord.id,
    task: task ? record.id : "",
    session: task ? "" : record.id,
    name_ar: task ? record.getString("name_ar") : assessmentName,
    name_en: task ? record.getString("name_en") : assessmentName,
    case_name: caseRecord.getString("name"),
    change: added ? "added" : "edited",
  })
  e.app.save(notification)
}

function markRead(e) {
  const user = require(__hooks + "/lib/security-policy.js").freshUser(e.app, e.auth)
  if (!clientRoles.includes(user.getString("role"))) throw new ForbiddenError("Client access required.")
  const { id, through } = e.requestInfo().body
  if (typeof id !== "string" || !/^[a-z0-9]{15}$/.test(id)) throw new BadRequestError("Invalid notification.")
  const notification = e.app.findRecordById("assignment_notifications", id)
  if (notification.getString("recipient") !== user.id) throw new NotFoundError("Notification not found.")

  if (through === true) {
    e.app.db().newQuery(
      "UPDATE assignment_notifications SET read = TRUE WHERE recipient = {:recipient} AND read = FALSE AND (created < {:created} OR (created = {:created} AND id <= {:id}))"
    ).bind({ recipient: user.id, created: notification.getString("created"), id }).execute()
  } else if (!notification.getBool("read")) {
    notification.set("read", true)
    e.app.save(notification)
  }
  return e.json(200, { ok: true })
}

module.exports = { recordNotification, markRead }
