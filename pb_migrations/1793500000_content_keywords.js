// Preserve legacy categories while enabling freely authored keywords.
migrate((app) => {
  for (const name of ["blog_pages", "programs", "public_lectures"]) {
    const collection = app.findCollectionByNameOrId(name)
    if (!collection.fields.getByName("keywords")) {
      collection.fields.add(new TextField({ name: "keywords", max: 5000 }))
      app.save(collection)
    }
    const legacyField = name === "blog_pages" ? "category" : "subcategory"
    const records = app.findRecordsByFilter(name, "keywords = '' && " + legacyField + " != ''", "", 0)
    for (const record of records) {
      const key = record.getString(legacyField)
      const matches = app.findRecordsByFilter("blog_categories", "key = {:key}", "", 1, 0, {key})
      record.set("keywords", matches.length ? (matches[0].getString("label_ar") || matches[0].getString("label_en") || key) : key)
      app.save(record)
    }
  }
  try {
    const view = app.findCollectionByNameOrId("public_lectures_public")
    if (!/\bkeywords\b/.test(view.viewQuery)) {
      view.viewQuery = view.viewQuery.replace(/\bFROM\s+public_lectures\b/i, ", keywords FROM public_lectures")
      app.save(view)
    }
  } catch (error) {
    if (!String(error).includes("no rows") && !String(error).includes("not found")) throw error
  }
}, () => {
  // Keep authored keywords on rollback.
})
