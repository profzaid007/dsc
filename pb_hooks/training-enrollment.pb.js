onRecordCreate(
  (e) => require(`${__hooks}/lib/training-enrollment.js`)(e, "create"),
  "cases"
)
onRecordUpdate(
  (e) => require(`${__hooks}/lib/training-enrollment.js`)(e, "update"),
  "cases"
)
onRecordDelete(
  (e) => require(`${__hooks}/lib/training-enrollment.js`)(e, "delete"),
  "cases"
)
onRecordCreateRequest((e) => {
  if (e.record.getString("program_id"))
    throw new BadRequestError("Use case-based training enrollment")
  return e.next()
}, "event_registrations")
onRecordUpdateRequest((e) => {
  if (e.record.getString("program_id"))
    throw new BadRequestError("Manage this enrollment from its case")
  return e.next()
}, "event_registrations")
routerAdd("POST", "/api/dsc/programs/{id}/enroll", (e) => {
  if (!e.auth || !e.auth.getBool("is_active"))
    throw new ForbiddenError("Sign in to enroll")
  const id = e.request.pathValue("id"),
    program = e.app.findRecordById("programs", id)
  let row
  e.app.runInTransaction((app) => {
    const existing = app.findRecordsByFilter(
      "cases",
      "program_id = {:p} && user = {:u} && program_status != 'cancelled' && portal_type = 'Attending Training'",
      "",
      1,
      0,
      { p: id, u: e.auth.id }
    )
    if (existing.length) {
      row = existing[0]
      return
    }
    row = new Record(app.findCollectionByNameOrId("cases"))
    const title = program.get("name")
    row.set(
      "name",
      typeof title === "object" ? title.en || title.ar : String(title)
    )
    row.set("user", e.auth.id)
    row.set("portal_type", "Attending Training")
    row.set("service_type", row.getString("name"))
    row.set("program_id", id)
    row.set("program_status", "enrolled")
    row.set("status", "pending")
    row.set("user_details", {
      name: e.auth.getString("name"),
      email: e.auth.getString("email"),
      contact: e.auth.getString("contact_number"),
    })
    app.save(row)
  })
  return e.json(200, row)
})

onRecordUpdateRequest((e) => {
  if (
    Object.prototype.hasOwnProperty.call(
      e.requestInfo().body,
      "current_registrations"
    )
  )
    throw new BadRequestError("Enrollment counts are maintained by the server")
  return e.next()
}, "programs")

onRecordUpdateRequest((e) => {
  if (
    e.record.original().getString("portal_type") === "Attending Training" &&
    Object.prototype.hasOwnProperty.call(e.requestInfo().body, "program_status")
  ) {
    const policy = require(__hooks + "/lib/security-policy.js"),
      u = policy.freshUser(e.app, e.auth)
    if (
      u.getString("role") !== "super_admin" &&
      !(
        u.getString("role") === "admin" &&
        policy.effective(e.app, u).includes("training.update")
      )
    )
      throw new ForbiddenError("Training update permission required")
  }
  return e.next()
}, "cases")
