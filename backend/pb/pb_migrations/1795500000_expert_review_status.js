migrate(app => {
  const profiles = app.findCollectionByNameOrId("expert_profiles")
  if (!profiles.fields.getByName("review_status")) {
    profiles.fields.add(new SelectField({ name: "review_status", values: ["pending", "rejected"], maxSelect: 1 }))
    app.save(profiles)
  }
}, () => {
  throw new Error("Restore a reviewed backup to remove expert review history.")
})
