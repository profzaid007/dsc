migrate(
  (app) => {
    for (const name of [
      "individual_profiles",
      "parent_profiles",
      "organization_profiles",
    ]) {
      const c = app.findCollectionByNameOrId(name)
      if (!c.fields.getByName("submission_key"))
        c.fields.add(new TextField({ name: "submission_key", max: 64 }))
      c.indexes.push(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_" +
          name +
          "_submission ON " +
          name +
          " (submission_key) WHERE submission_key != ''"
      )
      app.save(c)
    }
  },
  () => {
    throw new Error("Registration retry keys must be preserved")
  }
)
