module.exports = e => {
  const user = require(__hooks + "/lib/security-policy.js").freshUser(e.app, e.auth)
  if (!["parent", "care_foundation", "individual", "organization"].includes(user.getString("role")))
    throw new ForbiddenError("Assignments are available to case owners.")
  for (const name of ["cases", "case_tools", "assessment_sessions", "assessments"]) {
    try { e.app.findCollectionByNameOrId(name) }
    catch { throw new BadRequestError("Assignments cannot be loaded: the backend is missing " + name + ". Apply the assignment/assessment schema migrations.") }
  }
  const owned = e.app.findRecordsByFilter("cases", "user = {:user}", "name,id", 1001, 0, {user:user.id})
  if (owned.length > 1000) throw new BadRequestError("Too many cases. Contact your administrator to narrow the assignment list.")
  const ownerDisplay = owned.length ? require(__hooks + "/lib/case-owner-display.js")(e.app, owned[0]) : null
  const caseNames = {};for (const c of owned) caseNames[c.id] = c.getString("name")
  const tasks = e.app.findRecordsByFilter("case_tools", "case.user = {:user} && is_visible_to_user = true", "-created,id", 1001, 0, {user:user.id})
  const sessions = e.app.findRecordsByFilter("assessment_sessions", "recipient = {:user} && case.user = {:user}", "-created,id", 1001, 0, {user:user.id})
  if (tasks.length + sessions.length > 1000) throw new BadRequestError("Too many assignments. Contact your administrator to narrow the assignment list.")
  const assignments = []
  for (const task of tasks) {
    const caseId = task.getString("case")
    if (!Object.prototype.hasOwnProperty.call(caseNames,caseId)) continue
    assignments.push({id:task.id,kind:"task",case:caseId,caseName:caseNames[caseId],owner_display:ownerDisplay,name_en:task.getString("name_en"),name_ar:task.getString("name_ar"),status:task.getString("status"),created:task.getString("created")})
  }
  for (const session of sessions) {
    const caseId = session.getString("case")
    if (!Object.prototype.hasOwnProperty.call(caseNames,caseId)) continue
    const assessment = e.app.findRecordById("assessments",session.getString("assessment"))
    assignments.push({id:session.id,kind:"assessment",case:caseId,caseName:caseNames[caseId],owner_display:ownerDisplay,name_en:assessment.getString("name"),name_ar:assessment.getString("name"),status:session.getString("submitted_at") ? "completed" : session.getString("status"),created:session.getString("created")})
  }
  assignments.sort((a,b)=>b.created.localeCompare(a.created))
  return e.json(200,{cases:owned.map(c=>({id:c.id,name:c.getString("name"),owner_display:ownerDisplay})),assignments})
}
