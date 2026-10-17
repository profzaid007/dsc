// A private idempotency key prevents retrying a successful submission from creating duplicates.
migrate(app => {
  const c = app.findCollectionByNameOrId("expert_profiles")
  if (!c.fields.getByName("submission_key")) {
    c.fields.add(new TextField({name:"submission_key", max:64, hidden:true}))
    app.save(c)
  }
}, () => {})
