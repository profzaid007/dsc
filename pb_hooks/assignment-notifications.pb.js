onRecordAfterCreateSuccess((e) => {
  e.next()
  try {
    require(__hooks + "/lib/assignment-notifications.js").recordNotification(e, true)
  } catch (error) {
    e.app.logger().error("Failed to create assignment notification", "assignment", e.record.id, "error", String(error))
  }
}, "case_tools", "assessment_sessions")

onRecordAfterUpdateSuccess((e) => {
  e.next()
  try {
    require(__hooks + "/lib/assignment-notifications.js").recordNotification(e, false)
  } catch (error) {
    e.app.logger().error("Failed to create assignment edit notification", "assignment", e.record.id, "error", String(error))
  }
}, "case_tools", "assessment_sessions")

routerAdd("POST", "/api/dsc/assignment-notifications/read", (e) =>
  require(__hooks + "/lib/assignment-notifications.js").markRead(e),
  $apis.requireAuth("users")
)
