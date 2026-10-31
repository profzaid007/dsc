routerAdd("POST", "/api/dsc/security/experts/{id}/reject", e => {
  const policy = require(__hooks + "/lib/security-policy.js")
  e.app.runInTransaction(app => {
    const actor = policy.requirePermission(app, e.auth, "experts.approve")
    const user = app.findRecordById("users", e.request.pathValue("id"))
    if (user.getString("role") !== "expert" || user.getBool("is_active"))
      throw new BadRequestError("Only pending expert applications can be rejected.")
    const profile = app.findFirstRecordByFilter("expert_profiles", "user = {:id}", { id: user.id })
    const before = profile.getString("review_status")
    profile.set("review_status", "rejected")
    app.save(profile)
    policy.audit(app, actor, "expert.reject", "users", user.id,
      { review_status: before }, { review_status: "rejected" })
  })
  return e.json(200, { success: true })
}, $apis.requireAuth("users"))

// Applicants cannot hide their application or overwrite a review decision.
const guardReview = e => {
  if (Object.keys(e.requestInfo().body).some(key => key === "review_status" || key.startsWith("review_status")))
    throw new ForbiddenError("Review status can only be changed through expert approval.")
  return e.next()
}
onRecordCreateRequest(guardReview, "expert_profiles")
onRecordUpdateRequest(guardReview, "expert_profiles")
