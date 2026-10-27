function context(e, app) {
  const info = e.requestInfo()
  const ar = (info.body.language || info.query.language) === "ar"
  const message = (en, arabic) => ar ? arabic : en
  const policy = require(__hooks + "/lib/security-policy.js")
  const expert = policy.freshUser(app, e.auth)
  if (expert.getString("role") !== "expert") throw new ForbiddenError(message("Only experts can assign tools here.", "هذه العملية متاحة للخبراء فقط."))
  const caseId = e.request.pathValue("id")
  const allocations = app.findRecordsByFilter("case_experts", "case_id = {:caseId} && expert_id = {:expert}", "", 1001, 0, {caseId, expert:expert.id})
  if (!allocations.length) throw new ForbiddenError(message("You can assign tools only to cases allocated to you.", "يمكنك تكليف الحالات المخصصة لك فقط."))
  const c = app.findRecordById("cases", caseId)
  if (!c.getString("user")) throw new BadRequestError(message("Correct this case: its owner is missing.", "صحح سجل الحالة: صاحب الحساب غير محدد."))
  return {expert,c,message,policy}
}

function selectedType(app, tool, ctx) {
  const id = tool.getString("type")
  const type = app.findRecordById("lookups", id)
  if (type.getString("type") !== "tool_types") throw new BadRequestError(ctx.message("Correct the tool type record: it must reference a tool_types lookup.", "صحح سجل نوع الأداة: يجب ربطه بنوع من tool_types."))
  return type
}
function list(e) {
  const ctx = context(e,e.app)
  const rows = e.app.findRecordsByFilter("tools", 'status = "active"', "-created,id", 1001, 0)
  if (rows.length > 1000) throw new BadRequestError("Too many active tools. Contact your administrator.")
  const tools = []
  for (const tool of rows) {
    const type = selectedType(e.app,tool,ctx)
    tools.push({id:tool.id,name_en:tool.getString("name_en"),name_ar:tool.getString("name_ar"),description:tool.getString("description"),type_en:type.getString("label_en"),type_ar:type.getString("label_ar")})
  }
  return e.json(200,{tools})
}
function create(e) {
  const body = e.requestInfo().body
  let id
  e.app.runInTransaction(app => {
    const ctx = context(e,app)
    if (typeof body.tool_id !== "string" || !body.tool_id.trim()) throw new BadRequestError(ctx.message("Select a tool to assign.", "اختر أداة لتكليف الحالة بها."))
    const matches = app.findRecordsByFilter("tools", "id = {:id}", "", 1, 0, {id:body.tool_id})
    if (!matches.length) throw new BadRequestError(ctx.message("The selected tool no longer exists. Refresh the tool list.", "الأداة المختارة غير موجودة. حدّث قائمة الأدوات."))
    const tool = matches[0]
    if (tool.getString("status") !== "active") throw new BadRequestError(ctx.message("This tool is inactive. Select an active tool.", "هذه الأداة غير مفعلة. اختر أداة مفعلة."))
    selectedType(app,tool,ctx)
    const raw = tool.getString("config")
    const config = raw ? JSON.parse(raw) : null
    if (!config || typeof config !== "object" || Array.isArray(config) || !Object.keys(config).length) throw new BadRequestError(ctx.message("The selected tool has no configuration. Correct the tool before assigning it.", "الأداة المختارة بلا إعدادات. أكمل إعدادها قبل تكليف الحالة بها."))
    const r = new Record(app.findCollectionByNameOrId("case_tools"))
    r.set("case", ctx.c.id);r.set("type", tool.getString("type"))
    r.set("name_en",tool.getString("name_en"));r.set("name_ar",tool.getString("name_ar"))
    r.set("config",config);r.set("status","assigned");r.set("assigned_at",new Date().toISOString())
    r.set("is_not_template",false);r.set("is_visible_to_user",true);r.set("responses",{})
    app.save(r)
    ctx.policy.audit(app,ctx.expert,"assignment.create","case_tools",r.id,null,{case:ctx.c.id,tool:tool.id})
    id=r.id
  })
  return e.json(201,{id})
}
module.exports={list,create}
