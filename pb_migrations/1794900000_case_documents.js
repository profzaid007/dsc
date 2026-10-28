migrate(
  (app) => {
    const messages = app.findCollectionByNameOrId("internal_messages")
    const c = new Collection({ name: "case_documents", type: "base" })
    c.fields.add(
      new RelationField({
        name: "case",
        collectionId: app.findCollectionByNameOrId("cases").id,
        required: true,
        maxSelect: 1,
      })
    )
    c.fields.add(
      new RelationField({
        name: "uploaded_by",
        collectionId: app.findCollectionByNameOrId("users").id,
        required: true,
        maxSelect: 1,
      })
    )
    c.fields.add(new TextField({ name: "title", required: true, max: 250 }))
    c.fields.add(
      new FileField({
        name: "file",
        required: true,
        maxSelect: 1,
        maxSize: 10485760,
        protected: true,
        mimeTypes: messages.fields.getByName("attachments").mimeTypes,
      })
    )
    c.fields.add(
      new RelationField({
        name: "source_message",
        collectionId: messages.id,
        maxSelect: 1,
      })
    )
    c.fields.add(new TextField({ name: "source_filename", max: 255 }))
    c.fields.add(new AutodateField({ name: "created", onCreate: true }))
    c.fields.add(
      new AutodateField({ name: "updated", onCreate: true, onUpdate: true })
    )
    const active = '@request.auth.id != "" && @request.auth.is_active = true'
    const allocated =
      '(@request.auth.role = "expert" && @collection.case_experts:document_access.case_id ?= case && @collection.case_experts:document_access.expert_id ?= @request.auth.id)'
    const admin = (permission) =>
      '(@request.auth.role = "super_admin" || (@request.auth.role = "admin" && @request.auth.security_permissions:each ?= "' +
      permission +
      '"))'
    c.listRule =
      active +
      " && (case.user = @request.auth.id || " +
      allocated +
      " || " +
      admin("cases.read") +
      ")"
    c.viewRule = c.listRule
    c.createRule =
      active +
      ' && uploaded_by = @request.auth.id && source_message = "" && source_filename = "" && (' +
      allocated +
      " || " +
      admin("cases.create") +
      ")"
    c.updateRule = null
    c.deleteRule = null
    c.indexes = [
      "CREATE UNIQUE INDEX idx_case_document_source ON case_documents (\"case\", source_message, source_filename) WHERE source_message != ''",
    ]
    app.save(c)
  },
  () => {
    throw new Error("Restore a reviewed backup to revert case documents.")
  }
)
