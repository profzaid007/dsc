migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("parent_profiles")
    if (!collection.fields.getByName("city_of_residence")) {
      collection.fields.add(new TextField({ name: "city_of_residence", max: 300 }))
      app.save(collection)
    }
  },
  () => { throw new Error("Parent residence data must be preserved") }
)
