// Blog articles have one authored version, regardless of the interface language.
migrate(app => {
  const c = app.findCollectionByNameOrId("blog_pages")
  const records = app.findAllRecords("blog_pages")
  const conflicts = []
  const values = []
  for (const r of records) {
    const result = { id: r.id }
    for (const field of ["title", "content"]) {
      const canonical = c.fields.getByName(field)
      const en = r.getString(field + "_en")
      const ar = r.getString(field + "_ar")
      const value = canonical ? r.getString(field) : (en || ar)
      if ((en && ar && en !== ar) || (canonical && ((en && en !== value) || (ar && ar !== value))))
        conflicts.push(r.id + ":" + field)
      result[field] = value
    }
    values.push(result)
  }
  if (conflicts.length) throw new Error("Blog records need correction before removing language fields. Choose one authored value for: " + conflicts.join(", "))
  if (!c.fields.getByName("title")) c.fields.add(new TextField({name:"title",max:5000}))
  if (!c.fields.getByName("content")) c.fields.add(new TextField({name:"content",max:1000000}))
  app.save(c)
  for (const value of values) {
    const record = app.findRecordById("blog_pages", value.id)
    record.set("title", value.title)
    record.set("content", value.content)
    app.save(record)
  }
  for (const name of ["title_en", "title_ar", "content_en", "content_ar"]) c.fields.removeByName(name)
  app.save(c)
}, () => {
  throw new Error("Use a reviewed backup to restore separate blog language fields.")
})
