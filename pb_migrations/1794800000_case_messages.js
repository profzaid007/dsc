// One inbox for internal and case conversations. Case attachments are private.
migrate(
  (app) => {
    const c = app.findCollectionByNameOrId("internal_messages")
    if (!c.fields.getByName("subject"))
      c.fields.add(new TextField({ name: "subject", max: 200 }))
    c.fields.add(
      new RelationField({
        name: "case",
        collectionId: app.findCollectionByNameOrId("cases").id,
        maxSelect: 1,
      })
    )
    c.fields.add(
      new FileField({
        name: "attachments",
        maxSelect: 5,
        maxSize: 10485760,
        protected: true,
        mimeTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
          "text/plain",
          "text/csv",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "audio/mpeg",
          "audio/wav",
          "video/mp4",
        ],
      })
    )
    const active = '@request.auth.id != "" && @request.auth.is_active = true'
    const staff =
      '(@request.auth.role = "super_admin" || (@request.auth.role = "admin" && @request.auth.security_permissions:each ?= "messages.read"))'
    const allocated =
      '(@request.auth.role = "expert" && @collection.case_experts:message_access.case_id ?= case && @collection.case_experts:message_access.expert_id ?= @request.auth.id)'
    const access =
      '(case = "" || case.user = @request.auth.id || ' +
      staff +
      " || " +
      allocated +
      ")"
    c.listRule =
      active +
      " && (sender = @request.auth.id || recipient = @request.auth.id) && " +
      access
    c.viewRule = c.listRule
    // Pair/case authorization is also checked against fresh records by the request hook.
    c.createRule =
      active +
      ' && sender = @request.auth.id && recipient != @request.auth.id && recipient.is_active = true && read = false && subject != "" && ((case != "" && ' +
      access +
      ') || (case = "" && (@request.auth.role = "expert" || @request.auth.role = "admin" || @request.auth.role = "super_admin")))'
    c.updateRule = c.viewRule + " && recipient = @request.auth.id"
    c.deleteRule = null
    app.save(c)
  },
  () => {
    throw new Error(
      "Restore a reviewed backup to revert case messages and private attachments."
    )
  }
)
