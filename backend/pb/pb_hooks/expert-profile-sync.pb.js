onRecordUpdateRequest((e) => {
  if (
    !e.record.getString("public_name_ar").trim() ||
    !e.record.getString("public_name_en").trim()
  )
    throw new BadRequestError(
      "Both Arabic and English expert names are required"
    )
  e.app.runInTransaction((app) => {
    e.app = app
    e.next()
    const user = app.findRecordById("users", e.record.getString("user"))
    user.set(
      "name",
      e.record.getString("public_name_ar").trim() ||
        e.record.getString("public_name_en").trim()
    )
    app.save(user)
  })
}, "expert_profiles")
onRecordCreateRequest((e) => {
  if (
    !e.record.getString("public_name_ar").trim() ||
    !e.record.getString("public_name_en").trim()
  )
    throw new BadRequestError(
      "Both Arabic and English expert names are required"
    )
  e.app.runInTransaction((app) => {
    e.app = app
    e.next()
    const user = app.findRecordById("users", e.record.getString("user"))
    user.set(
      "name",
      e.record.getString("public_name_ar").trim() ||
        e.record.getString("public_name_en").trim()
    )
    app.save(user)
  })
}, "expert_profiles")
