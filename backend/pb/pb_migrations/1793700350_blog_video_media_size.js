// Support uploaded article videos while keeping a bounded media size.
migrate(app => {
  const collection = app.findCollectionByNameOrId("blog_pages")
  const field = collection.fields.getByName("media")
  if (!field) throw new Error("Missing blog media field")
  field.maxSize = Math.max(field.maxSize || 0, 50 * 1024 * 1024)
  app.save(collection)
}, () => {})
