// Page title overrides are public; mutations require active CMS grants.
migrate(app => {
  const permission = action => '@request.auth.id != "" && @request.auth.is_active = true && @request.auth.security_permissions:each ?= "cms.' + action + '"'
  const collection = new Collection({ name: "page_seo", type: "base" })
  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = permission("create")
  collection.updateRule = permission("update")
  collection.deleteRule = permission("delete")
  collection.fields.add(new TextField({ name: "path", required: true, max: 500, pattern: "^/[^?#]*$" }))
  collection.fields.add(new TextField({ name: "title_ar", max: 150 }))
  collection.fields.add(new TextField({ name: "title_en", max: 150 }))
  collection.indexes = [
    "CREATE UNIQUE INDEX idx_page_seo_path ON page_seo (path)",
    "CREATE UNIQUE INDEX idx_page_seo_ar ON page_seo (title_ar) WHERE title_ar != ''",
    "CREATE UNIQUE INDEX idx_page_seo_en ON page_seo (title_en COLLATE NOCASE) WHERE title_en != ''",
  ]
  app.save(collection)
}, app => { app.delete(app.findCollectionByNameOrId("page_seo")) })
