// Blog articles have one authored version, regardless of the interface language.
migrate(app => {
  const c = app.findCollectionByNameOrId("blog_pages")
  const records = app.findAllRecords("blog_pages")
  const conflicts = []
  const values = []
  for (const r of records) {
    const arabicTitle = r.getString("title_ar")
    const title = c.fields.getByName("title")
      ? r.getString("title")
      : (arabicTitle.trim() ? arabicTitle : r.getString("title_en"))
    const hasCanonicalContent = c.fields.getByName("content")
    const englishContent = r.getString("content_en")
    const arabicContent = r.getString("content_ar")
    // The editor selected content_en for the legacy post with slug "new-post".
    if (!hasCanonicalContent && r.id === "vt56rgypio18iea") {
      if (englishContent.trim()) values.push({ id: r.id, title, content: englishContent })
      else conflicts.push(r.id + ":content_en")
      continue
    }
    const content = hasCanonicalContent ? r.getString("content") : (englishContent || arabicContent)
    if ((englishContent && arabicContent && englishContent !== arabicContent) ||
        (hasCanonicalContent && ((englishContent && englishContent !== content) || (arabicContent && arabicContent !== content)))) {
      conflicts.push(r.id + ":content")
    }
    values.push({ id: r.id, title, content })
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
