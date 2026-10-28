function uploadAccess(app, auth, caseId) {
  const p = require(`${__hooks}/lib/security-policy.js`),
    user = p.freshUser(app, auth)
  app.findRecordById("cases", caseId)
  if (user.getString("role") === "admin")
    p.requirePermission(app, user, "cases.create")
  else if (user.getString("role") !== "super_admin") {
    const rows = app.findRecordsByFilter(
      "case_experts",
      "case_id = {:caseId} && expert_id = {:id}",
      "",
      1,
      0,
      { caseId, id: user.id }
    )
    if (user.getString("role") !== "expert" || !rows.length)
      throw new ForbiddenError(
        "Only an allocated expert can add case documents. / إضافة المستندات متاحة للخبير المخصص للحالة فقط."
      )
  }
  return user
}
function create(e) {
  const user = uploadAccess(e.app, e.auth, e.record.getString("case"))
  if (
    e.record.getString("uploaded_by") !== user.id ||
    e.record.getString("source_message") ||
    e.record.getString("source_filename")
  )
    throw new ForbiddenError(
      "Document provenance cannot be supplied by the client."
    )
  e.record.set("title", e.record.getString("title").trim())
}
function saveAttachment(e) {
  const caseId = e.request.pathValue("caseId"),
    body = e.requestInfo().body
  const expert = uploadAccess(e.app, e.auth, caseId)
  if (expert.getString("role") !== "expert")
    throw new ForbiddenError(
      "Only the expert receiving a client message can save its attachment."
    )
  if (typeof body.message_id !== "string" || typeof body.filename !== "string")
    throw new BadRequestError("Select a message attachment.")
  let result
  e.app.runInTransaction((app) => {
    uploadAccess(app, e.auth, caseId)
    const message = app.findRecordById("internal_messages", body.message_id)
    const c = app.findRecordById("cases", caseId)
    const sender = app.findRecordById("users", message.getString("sender"))
    if (
      message.getString("case") !== caseId ||
      message.getString("recipient") !== expert.id ||
      message.getString("sender") !== c.getString("user") ||
      !["parent", "individual", "organization", "care_foundation"].includes(
        sender.getString("role")
      )
    )
      throw new ForbiddenError(
        "Save attachments only from client messages sent to you for this case. / يمكنك حفظ مرفقات رسائل صاحب هذه الحالة المرسلة إليك فقط."
      )
    if (!message.getStringSlice("attachments").includes(body.filename))
      throw new BadRequestError(
        "This attachment does not belong to the selected message."
      )
    const existing = app.findRecordsByFilter(
      "case_documents",
      "case = {:caseId} && source_message = {:messageId} && source_filename = {:filename}",
      "",
      1,
      0,
      { caseId, messageId: message.id, filename: body.filename }
    )
    if (existing.length) {
      result = existing[0]
      return
    }
    const fs = app.newFilesystem()
    let reader
    try {
      reader = fs.getReader(message.baseFilesPath() + "/" + body.filename)
      const file = $filesystem.fileFromBytes(
        toBytes(reader, 10485761),
        body.filename
      )
      const doc = new Record(app.findCollectionByNameOrId("case_documents"))
      doc.set("case", caseId)
      doc.set("uploaded_by", expert.id)
      doc.set("title", body.filename)
      doc.set("source_message", message.id)
      doc.set("source_filename", body.filename)
      doc.set("file", file)
      app.save(doc)
      result = doc
    } finally {
      if (reader) reader.close()
      fs.close()
    }
  })
  return e.json(200, result)
}
module.exports = { create, saveAttachment }
