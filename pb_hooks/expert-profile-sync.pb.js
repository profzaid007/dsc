onRecordUpdateRequest((e) => {
  const previousPhoto = e.record.original().getString("profile_photo")
  const nextPhoto = e.record.getString("profile_photo")
  if (
    previousPhoto &&
    !nextPhoto &&
    !e.record.getUploadedFiles("profile_photo").length &&
    String(e.requestInfo().body.confirm_profile_photo_removal) !== "true"
  )
    throw new BadRequestError(
      "Photo removal must be explicitly requested. Reload the profile and use Remove photo."
    )
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
    // Uploaded file names are finalized by PocketBase during the save.
    const savedPhoto = e.record.getString("profile_photo")
    const user = app.findRecordById("users", e.record.getString("user"))
    user.set(
      "name",
      e.record.getString("public_name_ar").trim() ||
        e.record.getString("public_name_en").trim()
    )
    app.save(user)
    if (previousPhoto !== savedPhoto) {
      const policy = require(`${__hooks}/lib/security-policy.js`)
      policy.audit(
        app,
        e.auth,
        savedPhoto ? "expert.photo.replace" : "expert.photo.remove",
        "expert_profiles",
        e.record.id,
        { profile_photo: previousPhoto },
        { profile_photo: savedPhoto }
      )
    }
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
