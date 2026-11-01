migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("case_documents")
    collection.fields.add(new TextField({ name: "description", max: 2000 }))
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("case_documents")
    collection.fields.removeByName("description")
    app.save(collection)
  }
)
