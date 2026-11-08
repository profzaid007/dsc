migrate(
  (app) => {
    const messages = app.findCollectionByNameOrId("internal_messages")
    const active = '@request.auth.id != "" && @request.auth.is_active = true'
    const staff = '(@request.auth.role = "super_admin" || (@request.auth.role = "admin" && @request.auth.security_permissions:each ?= "messages.read"))'
    const participant = '(sender = @request.auth.id || recipient = @request.auth.id)'
    const caseAccess = '(case = "" || case.user = @request.auth.id || (@request.auth.role = "expert" && @collection.case_experts:message_access.case_id ?= case && @collection.case_experts:message_access.expert_id ?= @request.auth.id))'
    messages.listRule = messages.viewRule =
      active + ' && (' + staff + ' || (@request.auth.role != "admin" && ' + participant + ' && ' + caseAccess + '))'
    app.save(messages)
  },
  (app) => {
    const messages = app.findCollectionByNameOrId("internal_messages")
    messages.listRule = messages.viewRule = messages.updateRule.replace(/ && recipient = @request\.auth\.id$/, "")
    app.save(messages)
  }
)
