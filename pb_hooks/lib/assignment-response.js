// Response-only fields. Never save a record after applying this transformation.
function canEditConfiguration(app, user, record) {
  if (!user) return false
  const role = user.getString("role")
  if (role === "super_admin") return true
  if (role === "admin")
    return require(__hooks + "/lib/security-policy.js").effective(app, user).includes("assignments.update")
  if (role !== "expert" || !record.getBool("is_not_template") || record.getString("status") === "completed") return false
  const caseId = record.getString("case")
  const allocations = app.findRecordsByFilter("case_experts", "case_id = {:caseId} && expert_id = {:expert}", "", 1, 0, {caseId, expert:user.id})
  if (!allocations.length || !app.findRecordById("cases", caseId).getString("user")) return false
  const audit = app.findRecordsByFilter("security_audit_log", 'actor = {:actor} && action = "assignment.create" && target_type = "case_tools" && target_id = {:id}', "", 1, 0, {actor:user.id, id:record.id})
  return audit.length > 0
}

function enrich(e) {
  const auth = e.requestInfo && e.requestInfo.auth
  let user = null
  // Native PocketBase superusers are staff too; normal accounts are refreshed
  // rather than trusting role/active fields from a stale authentication token.
  const superuser = auth && auth.collection().name === "_superusers"
  if (auth && !superuser) {
    try { user = require(__hooks + "/lib/security-policy.js").freshUser(e.app, auth) } catch { /* fail closed */ }
  }
  const staff = superuser || (user && ["super_admin", "admin", "expert"].includes(user.getString("role")))
  if (!staff) {
    const raw = e.record.getString("config")
    if (raw) {
      const config = JSON.parse(raw)
      if (config && typeof config === "object" && !Array.isArray(config) && config.notesVisibleToUser !== true) {
        delete config.notes
        e.record.set("config", config)
      }
    }
  }
  let editable = !!superuser
  if (!editable) {
    try { editable = canEditConfiguration(e.app, user, e.record) } catch { /* capability fails closed */ }
  }
  e.record.set("can_edit_configuration", editable)
  e.record.withCustomData(true)
  return e.next()
}

module.exports = {canEditConfiguration, enrich}
