// Shared by request hooks and the generated security migration. No client input
// is ever accepted as an effective grant.
const modules = [
  ["users", "Users", "المستخدمون"],
  ["experts", "Experts", "الخبراء"],
  ["cases", "Cases", "الحالات"],
  ["tools", "Tools", "الأدوات"],
  ["assignments", "Assignments", "التكليفات"],
  ["allocations", "Allocations", "التخصيصات"],
  ["training", "Training", "التدريب"],
  ["lectures", "Public lectures", "المحاضرات العامة"],
  ["payments", "Payments", "المدفوعات"],
  ["cms", "Content", "المحتوى"],
  ["settings", "Settings", "الإعدادات"],
  ["messages", "Messages", "الرسائل"],
]
const actions = [
  ["create", "Create", "إنشاء"],
  ["read", "Read", "قراءة"],
  ["update", "Update", "تعديل"],
  ["delete", "Delete", "حذف"],
]
const catalog = []
for (const m of modules)
  for (const a of actions) {
    // Messaging has no delete operation. Backups are deliberately not delegable.
    if (m[0] === "messages" && a[0] === "delete") continue
    if (m[0] === "payments" && ["create", "delete"].includes(a[0])) continue
    catalog.push({
      key: m[0] + "." + a[0],
      module: m[0],
      action: a[0],
      name_en: m[1] + ": " + a[1],
      name_ar: m[2] + ": " + a[2],
    })
  }
catalog.push(
  {
    key: "users.reset_password",
    module: "users",
    action: "reset_password",
    name_en: "Reset password",
    name_ar: "إعادة تعيين كلمة المرور",
  },
  {
    key: "experts.approve",
    module: "experts",
    action: "approve",
    name_en: "Approve expert",
    name_ar: "اعتماد خبير",
  },
  {
    key: "payments.export",
    module: "payments",
    action: "export",
    name_en: "Export payments",
    name_ar: "تصدير المدفوعات",
  }
)
const collectionModules = {
  users: "users",
  individual_profiles: "users",
  parent_profiles: "users",
  organization_profiles: "users",
  expert_profiles: "experts",
  expert_display_settings: "experts",
  roles_management: "settings",
  specialist_role_categories: "settings",
  expert_bank_details: "payments",
  cases: "cases",
  case_feedback: "cases",
  tools: "tools",
  tool_types: "tools",
  case_tools: "assignments",
  case_experts: "allocations",
  programs: "training",
  event_certificates: "training",
  public_lectures: "lectures",
  event_registrations: "events",
  home_pages: "cms",
  info_pages: "cms",
  blog_pages: "cms",
  blog_categories: "cms",
  portals: "cms",
  settings: "settings",
  lookups: "settings",
  internal_messages: "messages",
}
// These reference/configuration records were already readable by the public
// (or every signed-in user). Staff grants govern their management screens and
// writes; allocating an expert must not require settings-administration access.
const publicReadCollections = [
  "lookups",
  "tool_types",
  "roles_management",
  "specialist_role_categories",
  "blog_categories",
  "settings",
  "expert_display_settings",
]
function freshUser(app, auth) {
  if (!auth || auth.collection().name !== "users")
    throw new ForbiddenError("An active account is required.")
  const user = app.findRecordById("users", auth.id)
  if (!user.getBool("is_active"))
    throw new ForbiddenError("An active account is required.")
  return user
}
function effective(app, user) {
  if (!user.getBool("is_active")) return []
  if (user.getString("role") === "super_admin") return catalog.map((p) => p.key)
  if (user.getString("role") !== "admin") return []
  const assignments = app.findRecordsByFilter(
    "security_user_roles",
    "user = {:id} && role.is_active = true",
    "",
    0,
    0,
    { id: user.id }
  )
  const result = {}
  for (const a of assignments) {
    const grants = app.findRecordsByFilter(
      "security_role_permissions",
      "role = {:id}",
      "",
      0,
      0,
      { id: a.getString("role") }
    )
    for (const g of grants) {
      const p = app.findRecordById(
        "security_permissions",
        g.getString("permission")
      )
      result[p.getString("key")] = true
    }
  }
  return Object.keys(result).sort()
}
function requirePermission(app, auth, permission) {
  const user = freshUser(app, auth)
  if (
    user.getString("role") !== "super_admin" &&
    !effective(app, user).includes(permission)
  )
    throw new ForbiddenError("Permission required: " + permission)
  return user
}
function requireSuper(app, auth) {
  const user = freshUser(app, auth)
  if (user.getString("role") !== "super_admin")
    throw new ForbiddenError("Super Admin access required.")
  return user
}
function compile(app, userId) {
  const user = app.findRecordById("users", userId)
  user.set("security_permissions", effective(app, user))
  app.save(user)
}
function validateGrants(values) {
  if (
    !Array.isArray(values) ||
    values.length > catalog.length ||
    values.some(
      (v) => typeof v !== "string" || !catalog.some((p) => p.key === v)
    )
  )
    throw new BadRequestError("Invalid permission list.")
  const unique = Array.from(new Set(values)).sort()
  for (const value of unique) {
    const moduleName = value.split(".")[0]
    if (!value.endsWith(".read") && !unique.includes(moduleName + ".read"))
      throw new BadRequestError("Read permission is required for " + value)
  }
  return unique
}
function adminRule(permission) {
  return (
    '(@request.auth.role = "admin" && @request.auth.security_permissions:each ?= "' +
    permission +
    '")'
  )
}
function permissionsRule(module, action) {
  if (module === "events")
    return (
      '((lecture_id != "" && ' +
      adminRule("lectures." + action) +
      ') || (lecture_id = "" && ' +
      adminRule("training." + action) +
      "))"
    )
  return adminRule(module + "." + action)
}
function rewriteRule(rule, module, action) {
  if (rule === null || rule === undefined) return rule
  return rule.replace(
    /@request\.auth\.role\s*=\s*["']admin["']/g,
    permissionsRule(module, action)
  )
}
function audit(app, actor, action, targetType, targetId, before, after) {
  const record = new Record(app.findCollectionByNameOrId("security_audit_log"))
  record.set("actor", actor.id)
  record.set("action", action)
  record.set("target_type", targetType)
  record.set("target_id", targetId)
  record.set("before", before)
  record.set("after", after)
  app.save(record)
}
module.exports = {
  modules,
  catalog,
  collectionModules,
  publicReadCollections,
  freshUser,
  effective,
  requirePermission,
  requireSuper,
  compile,
  validateGrants,
  adminRule,
  permissionsRule,
  rewriteRule,
  audit,
}
