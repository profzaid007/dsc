migrate((app) => {
  const relation = (name, collection, required = false) =>
    new RelationField({
      name, collectionId: app.findCollectionByNameOrId(collection).id,
      required, maxSelect: 1, cascadeDelete: true,
    })
  const access = [
    '@request.auth.is_active = true',
    '(@request.auth.role = "parent" || @request.auth.role = "individual" || @request.auth.role = "organization" || @request.auth.role = "care_foundation")',
    'recipient = @request.auth.id',
    'case.user = @request.auth.id',
    '((task != "" && task.case = case && task.is_visible_to_user = true) || (session != "" && session.case = case && session.recipient = @request.auth.id))',
  ].join(" && ")
  const notifications = new Collection({
    name: "assignment_notifications",
    type: "base",
  })
  notifications.listRule = access
  notifications.viewRule = access
  for (const field of [
      relation("recipient", "users", true),
      relation("case", "cases", true),
      relation("task", "case_tools"),
      relation("session", "assessment_sessions"),
      new TextField({ name: "name_ar" }),
      new TextField({ name: "name_en" }),
      new TextField({ name: "case_name" }),
      new SelectField({ name: "change", values: ["added", "edited"], required: true }),
      new BoolField({ name: "read" }),
      new AutodateField({ name: "created", onCreate: true }),
  ]) notifications.fields.add(field)
  notifications.indexes = ["CREATE INDEX idx_assignment_notification_inbox ON assignment_notifications (recipient, read, created)"]
  app.save(notifications)
}, (app) => app.delete(app.findCollectionByNameOrId("assignment_notifications")))
