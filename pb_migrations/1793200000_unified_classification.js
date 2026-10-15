// Generated from lib/classification-catalog.json. Preserve IDs and historical data.
migrate((app) => {
  const catalog = {
  "main": [
    {
      "key": "special-needs",
      "en": "Special Needs & Rehabilitation",
      "ar": "الاحتياجات الخاصة والتأهيل",
      "media_only": false
    },
    {
      "key": "mental-health",
      "en": "Psychology & Family Counseling",
      "ar": "علم النفس والإرشاد الأسري",
      "media_only": false
    },
    {
      "key": "medical",
      "en": "Medicine & Health",
      "ar": "الطب والصحة",
      "media_only": false
    },
    {
      "key": "education",
      "en": "Education, Training & Talent Development",
      "ar": "التعليم والتدريب وتنمية المواهب",
      "media_only": false
    },
    {
      "key": "research",
      "en": "Research & Statistical Analysis",
      "ar": "البحث العلمي والتحليل الإحصائي",
      "media_only": false
    },
    {
      "key": "leadership",
      "en": "Institutions, Leadership & Development",
      "ar": "المؤسسات والقيادة والتطوير",
      "media_only": false
    },
    {
      "key": "dsc-news",
      "en": "DSC News & Success Stories",
      "ar": "أخبار DSC وقصص النجاح",
      "media_only": true
    }
  ],
  "parents": {
    "autism": "special-needs",
    "adhd": "special-needs",
    "speech-language": "special-needs",
    "learning-disabilities": "special-needs",
    "aba-therapy": "special-needs",
    "mental-health": "mental-health",
    "psychological-assessment": "mental-health",
    "parenting-family-counseling": "mental-health",
    "educational-assessment": "education",
    "educational-consulting": "education",
    "giftedness-and-talent": "education",
    "scholarships": "education",
    "research": "research",
    "statistics": "research",
    "dsc-news": "dsc-news",
    "success-stories": "dsc-news"
  }
}
  const keys = catalog.main.map(c => c.key)
  const categoryCollection = app.findCollectionByNameOrId("specialist_role_categories")
  for (const field of [{ name: "is_active", type: "bool" }, { name: "media_only", type: "bool" }]) {
    if (!categoryCollection.fields.getByName(field.name)) categoryCollection.fields.add(new BoolField(field))
  }
  app.save(categoryCollection)
  const oldCategories = app.findRecordsByFilter("specialist_role_categories", "", "", 0, 0)
  const mainRecords = {}
  for (let order = 0; order < catalog.main.length; order++) {
    const main = catalog.main[order]
    const existing = oldCategories.find(c => c.getString("key") === main.key || (main.key === "mental-health" && c.getString("key") === "psychology"))
    const record = existing || new Record(categoryCollection)
    record.set("key", main.key)
    record.set("name_en", main.en)
    record.set("name_ar", main.ar)
    record.set("order", order)
    record.set("is_active", true)
    record.set("media_only", main.media_only)
    app.save(record)
    mainRecords[main.key] = record
  }
  // Unknown/custom historical categories stay available to old records, but are not offered for new selections.
  for (const record of oldCategories) {
    if (!keys.includes(record.getString("key"))) {
      record.set("is_active", false)
      app.save(record)
    }
  }
  const rolesCollection = app.findCollectionByNameOrId("roles_management")
  if (!rolesCollection.fields.getByName("category")) rolesCollection.fields.add(new RelationField({ name: "category", collectionId: categoryCollection.id, maxSelect: 1 }))
  app.save(rolesCollection)
  const roles = app.findRecordsByFilter("roles_management", "", "", 0, 0)
  for (const role of roles) {
    const original = oldCategories.find(c => c.id === role.getString("category"))
    let key = original ? original.getString("key") : role.getString("role_group")
    if (key === "psychology") key = "mental-health"
    if (key === "dsc-news") throw new Error("An existing specialist role is assigned to media; review it before migration")
    if (mainRecords[key]) {
      role.set("category", mainRecords[key].id)
      role.set("role_group", key)
      app.save(role)
    }
  }
  for (const name of ["blog_categories", "blog_pages", "programs", "public_lectures"]) {
    const collection = app.findCollectionByNameOrId(name)
    if (!collection.fields.getByName("main_category")) collection.fields.add(new SelectField({ name: "main_category", maxSelect: 1, values: keys }))
    if (["programs", "public_lectures"].includes(name) && !collection.fields.getByName("subcategory")) collection.fields.add(new TextField({ name: "subcategory", max: 200 }))
    app.save(collection)
  }
  const children = app.findRecordsByFilter("blog_categories", "", "", 0, 0)
  for (const child of children) {
    const parent = catalog.parents[child.getString("key")]
    if (parent) { child.set("main_category", parent); app.save(child) }
  }
  for (const post of app.findRecordsByFilter("blog_pages", "", "", 0, 0)) {
    const child = children.find(c => c.getString("key") === post.getString("category"))
    const parent = child && child.getString("main_category")
    if (parent && !post.getString("main_category")) { post.set("main_category", parent); app.save(post) }
  }
  // Match only exact existing labels; do not guess the subject of historical training.
  for (const program of app.findRecordsByFilter("programs", "", "", 0, 0)) {
    if (program.getString("main_category")) continue
    let label
    try { label = JSON.parse(program.getString("category")) } catch { continue }
    if (!label || typeof label !== "object") continue
    const child = children.find(c => (label.en && c.getString("label_en") === label.en) || (label.ar && c.getString("label_ar") === label.ar))
    if (child && child.getString("main_category")) {
      program.set("main_category", child.getString("main_category"))
      program.set("subcategory", child.getString("key"))
      app.save(program)
    }
  }
  // Keep public lecture projection in step with the new classification fields.
  try {
    const view = app.findCollectionByNameOrId("public_lectures_public")
    if (!view.viewQuery.includes("main_category")) {
      view.viewQuery = view.viewQuery.replace(/\bFROM\s+public_lectures\b/i, ", main_category, subcategory FROM public_lectures")
      app.save(view)
    }
  } catch (error) {
    // The view is optional, but a present broken view must not be ignored.
    if (!String(error).includes("no rows") && !String(error).includes("not found")) throw error
  }
}, () => {
  // Retain catalog and fields to preserve authored classifications on rollback.
})
