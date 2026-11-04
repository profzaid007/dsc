migrate(app => {
  try { app.findCollectionByNameOrId("specialist_role_categories"); throw new Error("Categories already exist; inspect before running the local repair") }
  catch (error) { if (String(error).includes("already exist")) throw error }
  const definitions = [{"key": "special-needs", "en": "Special Needs & Rehabilitation", "ar": "الاحتياجات الخاصة والتأهيل", "media_only": false}, {"key": "mental-health", "en": "Psychology & Family Counseling", "ar": "علم النفس والإرشاد الأسري", "media_only": false}, {"key": "medical", "en": "Medicine & Health", "ar": "الطب والصحة", "media_only": false}, {"key": "education", "en": "Education, Training & Talent Development", "ar": "التعليم والتدريب وتنمية المواهب", "media_only": false}, {"key": "research", "en": "Research & Statistical Analysis", "ar": "البحث العلمي والتحليل الإحصائي", "media_only": false}, {"key": "leadership", "en": "Institutions, Leadership & Development", "ar": "المؤسسات والقيادة والتطوير", "media_only": false}, {"key": "other", "en": "Other", "ar": "أخرى", "media_only": false}, {"key": "dsc-news", "en": "DSC News & Success Stories", "ar": "أخبار DSC وقصص النجاح", "media_only": true}]
  const keys = definitions.map(item => item.key)
  for (const role of app.findAllRecords("roles_management")) {
    if (!keys.includes(role.getString("role_group"))) throw new Error("Correct role group first: " + role.id)
  }
  const c = new Collection({name:"specialist_role_categories",type:"base",listRule:"",viewRule:"",createRule:null,updateRule:null,deleteRule:null,fields:[
    {name:"key",type:"text",required:true},
    {name:"name_en",type:"text",required:true},
    {name:"name_ar",type:"text",required:true},
    {name:"order",type:"number"},
    {name:"is_active",type:"bool"},
    {name:"media_only",type:"bool"}
  ],indexes:["CREATE UNIQUE INDEX idx_specialist_category_key ON specialist_role_categories (key)"]})
  app.save(c)
  for (const [index, item] of definitions.entries()) {
    const r = new Record(c)
    r.set("key", item.key);r.set("name_en", item.en);r.set("name_ar", item.ar)
    r.set("order", index);r.set("is_active", true);r.set("media_only", item.media_only === true)
    app.save(r)
  }
}, () => { throw new Error("Restore the local catalog backup to revert category setup") })
