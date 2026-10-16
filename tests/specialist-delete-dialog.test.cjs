const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")

class BlockedError extends Error {
  constructor(message, links, total) { super(message); this.links = links; this.total = total }
}

function screen(deleteItem, permissions = ["settings.read", "settings.create", "settings.update", "settings.delete"], view = "roles") {
  const state = []
  let index = 0
  const notices = []
  const writes = []
  const jsx = (type, props) => ({ type, props })
  const main = JSON.parse(fs.readFileSync("lib/classification-catalog.json", "utf8")).main
  const mocks = {
    "next/link": { __esModule: true, default: "Link" },
    "@/hooks/useUiTranslation": { useUiTranslation: () => text => text },
    "@/lib/classification": { MAIN_CLASSIFICATIONS: main, EXPERT_CLASSIFICATIONS: main.filter(c => !c.media_only), mainCategoryKey: key => key === "psychology" ? "mental-health" : key },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "lucide-react": new Proxy({}, { get: (_, key) => String(key) }),
    "@/app/dashboard/admin/settings/specialists/specialists.module.css": { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) },
    react: { useState: initial => {
      const key = index++
      if (!(key in state)) state[key] = initial
      return [state[key], value => { state[key] = value }]
    } },
    "@/lib/specialist-deletion": { deleteSpecialistItem: deleteItem, SpecialistDeletionBlockedError: BlockedError },
    "@/components/ui/dialog": Object.fromEntries(["Dialog", "DialogContent", "DialogHeader", "DialogTitle", "DialogDescription", "DialogFooter"].map(name => [name, name])),
    "@/components/ui/button": { Button: "Button" },
    "@/hooks/useAuth": { useAuth: () => ({ isAdmin: true, isSuperAdmin: false, isLoading: false }) },
    "@/hooks/usePermissions": { usePermissions: () => ({ can: key => permissions.includes(key) }) },
    "@/lib/lang-context": { useLang: () => ({ lang: "en" }) },
    "@/hooks/useSpecialists": { useSpecialists: () => ({ categories: [{ id: "medical-cat", key: "medical", name_en: "Medicine & Health", name_ar: "الطب والصحة" }, { id: "research-cat", key: "research", name_en: "Research", name_ar: "البحث العلمي" }], roles: [{ id: "physician", role_name_en: "Physician", role_name_ar: "طبيب", category: "medical-cat" }], loading: false, error: "", refresh: async () => {} }) },
    "@/lib/pb": { __esModule: true, default: { collection: name => ({ update: async (id, data) => { writes.push({ name, id, data }) }, create: async data => { writes.push({ name, data }) } }) }, getErrorMessage: error => error.message },
    sonner: { toast: { error: message => notices.push(message), success: message => notices.push(message) } },
  }
  const exports = {}
  new Function("exports", "require", "window", ts.transpileModule(fs.readFileSync("components/settings/SpecialistSettings.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText)(exports, name => { assert.ok(name in mocks, name); return mocks[name] }, { dispatchEvent() {} })
  const render = () => { index = 0; return exports.SpecialistSettings({ view }) }
  function nodes(tree) {
    if (!tree || typeof tree !== "object") return []
    if (Array.isArray(tree)) return tree.flatMap(nodes)
    return [tree, ...nodes(tree.props?.children)]
  }
  return { render, nodes, notices, writes }
}
test("failed deletion leaves its error visible inside the confirmation dialog", async () => {
  const message = "This role is used by experts or case assignments. Deactivate it instead."
  const ui = screen(async () => { throw new Error(message) })
  const deleteAction = ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "delete")
  deleteAction.props.onClick()
  const confirm = ui.nodes(ui.render()).find(node => node.type === "Button" && node.props.variant === "destructive")
  confirm.props.onClick()
  await new Promise(setImmediate)
  const nodes = ui.nodes(ui.render())
  assert.equal(nodes.find(node => node.type === "Dialog" && node.props.open).props.open, true)
  assert.equal(nodes.find(node => node.props?.role === "alert").props.children, message)
  assert.deepEqual(ui.notices, [message])
})

test("read-only settings access disables destructive specialist actions", () => {
  const ui = screen(async () => assert.fail("Deletion must not run"), ["settings.read"])
  const action = ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "delete")
  assert.equal(action.props.disabled, true)
})
test("successful confirmed deletion closes the dialog and reports success", async () => {
  const calls = []
  const ui = screen(async (...args) => { calls.push(args) })
  ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "delete").props.onClick()
  ui.nodes(ui.render()).find(node => node.type === "Button" && node.props.variant === "destructive").props.onClick()
  await new Promise(setImmediate)
  assert.equal(ui.nodes(ui.render()).some(node => node.type === "Dialog" && node.props.open), false)
  assert.deepEqual(calls, [["role", "physician", false]])
  assert.deepEqual(ui.notices, ["Deleted"])
})

 test("blocked deletion identifies the case and expert and links to their records", async () => {
  const ui = screen(async () => { throw new BlockedError("In use", [
    { id: "assignment", label: "Case: Autism & ADHD", detail: "Assigned expert: Hala aref", href: "/dashboard/admin/cases/653xglz46cjoevs" },
    { id: "profile", label: "Expert profile: Ahmed", href: "/dashboard/admin/experts/expert" },
  ], 2) })
  ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "delete").props.onClick()
  ui.nodes(ui.render()).find(node => node.type === "Button" && node.props.variant === "destructive").props.onClick()
  await new Promise(setImmediate)
  const nodes = ui.nodes(ui.render())
  const links = nodes.filter(node => node.type === "a")
  assert.equal(links[0].props.children, "Case: Autism & ADHD")
  assert.equal(links[0].props.href, "/dashboard/admin/cases/653xglz46cjoevs")
  assert.equal(links[1].props.href, "/dashboard/admin/experts/expert")
  assert.ok(nodes.some(node => node.props?.children === "Assigned expert: Hala aref"))
 })


test("classifications and roles render as separate settings", () => {
  for (const view of ["classifications", "roles"]) {
    const ui = screen(async () => {}, ["settings.read"], view)
    const nodes = ui.nodes(ui.render())
    assert.equal(nodes.some(node => node.props?.["aria-labelledby"] === "categories-heading"), view === "classifications")
    assert.equal(nodes.some(node => node.props?.["aria-labelledby"] === "roles-heading"), view === "roles")
  }
})

test("role form requires the category foreign key", () => {
  const ui = screen(async () => {})
  const add = ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "add")
  add.props.onClick()
  const field = ui.nodes(ui.render()).find(node => node.type === "select" && node.props.name === "category")
  assert.equal(field.props.required, true)
})


test("saving a role retains its category relation and canonical category key", async () => {
  const ui = screen(async () => {})
  ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "edit").props.onClick()
  ui.nodes(ui.render()).find(node => node.type === "select" && node.props.name === "category").props.onChange({ target: { value: "research-cat" } })
  await ui.nodes(ui.render()).find(node => node.type === "form").props.onSubmit({ preventDefault() {} })
  assert.equal(ui.writes[0].name, "roles_management")
  assert.equal(ui.writes[0].id, "physician")
  assert.equal(ui.writes[0].data.category, "research-cat")
  assert.equal(ui.writes[0].data.role_group, "research")
})


test("classifications expose Add, Edit and Delete when permitted", () => {
  const ui = screen(async () => {}, ["settings.read", "settings.create", "settings.update", "settings.delete"], "classifications")
  const section = ui.nodes(ui.render()).find(node => node.props?.["aria-labelledby"] === "categories-heading")
  for(const action of ["add","edit","delete"]) {
    const button=ui.nodes(section).find(node=>node.type==='button' && node.props.className===action)
    assert.ok(button,action)
    assert.equal(button.props.disabled,false,action)
  }
})

test("classification edits save the entered labels without recreating the record", async () => {
  const ui = screen(async () => {}, ["settings.read", "settings.update"], "classifications")
  ui.nodes(ui.render()).find(node=>node.type==='button' && node.props.className==='edit').props.onClick()
  const fields=ui.nodes(ui.render()).filter(node=>node.type==='input')
  const english=fields.find(node=>node.props.value==='Medicine & Health')
  const arabic=fields.find(node=>node.props.value==='الطب والصحة')
  english.props.onChange({target:{value:'Updated classification'}})
  arabic.props.onChange({target:{value:'تصنيف معدل'}})
  await ui.nodes(ui.render()).find(node=>node.type==='form').props.onSubmit({preventDefault(){}})
  assert.equal(ui.writes[0].name,'specialist_role_categories')
  assert.equal(ui.writes[0].id,'medical-cat')
  assert.equal(ui.writes[0].data.name_en,'Updated classification')
  assert.equal(ui.writes[0].data.name_ar,'تصنيف معدل')
  assert.equal(ui.writes[0].data.key,undefined)
})
