migrate((app) => {
  const profiles = app.findCollectionByNameOrId("organization_profiles")
  if (!profiles.fields.getByName("address")) {
    profiles.fields.add(new TextField({ name: "address", max: 1000 }))
    app.save(profiles)
  }
}, () => {
  throw new Error("Restore a reviewed backup to revert foundation addresses.")
})
