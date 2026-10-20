module.exports = (e, action) => {
  const originallyEnrolled =
    action === "update" &&
    e.record.original().getString("portal_type") === "Attending Training" &&
    e.record.original().getString("program_id")
  if (
    !originallyEnrolled &&
    (e.record.getString("portal_type") !== "Attending Training" ||
      !e.record.getString("program_id"))
  )
    return e.next()
  if (
    originallyEnrolled &&
    e.record.getString("portal_type") !== "Attending Training"
  )
    throw new BadRequestError("Enrollment identity cannot be changed")
  e.app.runInTransaction((app) => {
    e.app = app
    const id = e.record.getString("program_id"),
      user = e.record.getString("user")
    if (
      action === "update" &&
      (e.record.original().getString("program_id") !== id ||
        e.record.original().getString("user") !== user)
    )
      throw new BadRequestError("Enrollment identity cannot be changed")
    const program = app.findRecordById("programs", id)
    const active = app.findRecordsByFilter(
      "cases",
      "program_id = {:p} && portal_type = 'Attending Training' && program_status != 'cancelled' && id != {:id}",
      "",
      0,
      0,
      { p: id, id: e.record.id }
    )
    const joining =
      action !== "delete" &&
      e.record.getString("program_status") !== "cancelled"
    const wasActive =
      action === "update" &&
      e.record.original().getString("program_status") !== "cancelled"
    if (joining && !wasActive) {
      if (!["published", "in_progress"].includes(program.getString("status")))
        throw new BadRequestError("Enrollment is closed")
      if (active.some((row) => row.getString("user") === user))
        throw new BadRequestError("Already enrolled in this programme")
      const max = program.getInt("max_participants")
      if (max > 0 && active.length >= max)
        throw new BadRequestError("This programme is full")
    }
    e.next()
    program.set("current_registrations", active.length + (joining ? 1 : 0))
    app.save(program)
  })
}
