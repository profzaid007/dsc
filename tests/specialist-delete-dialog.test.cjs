const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")

class BlockedError extends Error {
  constructor(message, links, total) { super(message); this.links = links; this.total = total }
}

function screen(deleteItem) {
  const state = []
  let index = 0
  const notices = []
  const jsx = (type, props) => ({ type, props })
  const mocks = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: { useState: initial => {
      const key = index++
      if (!(key in state)) state[key] = initial
      return [state[key], value => { state[key] = value }]
    } },
    "@/lib/specialist-deletion": { deleteSpecialistItem: deleteItem, SpecialistDeletionBlockedError: BlockedError },
    "@/components/ui/dialog": Object.fromEntries(["Dialog", "DialogContent", "DialogHeader", "DialogTitle", "DialogDescription", "DialogFooter"].map(name => [name, name])),
    "@/components/ui/button": { Button: "Button" },
    "@/hooks/useAuth": { useAuth: () => ({ isAdmin: true, isSuperAdmin: false, isLoading: false }) },
    "@/lib/lang-context": { useLang: () => ({ lang: "en" }) },
    "@/hooks/useSpecialists": { useSpecialists: () => ({ categories: [], roles: [{ id: "physician", role_name_en: "Physician" }], loading: false, error: "", refresh: async () => {} }) },
    "@/lib/pb": { __esModule: true, default: {}, getErrorMessage: error => error.message },
    sonner: { toast: { error: message => notices.push(message), success: message => notices.push(message) } },
  }
  const exports = {}
  new Function("exports", "require", ts.transpileModule(fs.readFileSync("app/dashboard/admin/settings/specialists/page.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText)(exports, name => { assert.ok(name in mocks, name); return mocks[name] })
  const render = () => { index = 0; return exports.default() }
  function nodes(tree) {
    if (!tree || typeof tree !== "object") return []
    if (Array.isArray(tree)) return tree.flatMap(nodes)
    return [tree, ...nodes(tree.props?.children)]
  }
  return { render, nodes, notices }
}
test("failed deletion leaves its error visible inside the confirmation dialog", async () => {
  const message = "This role is used by experts or case assignments. Deactivate it instead."
  const ui = screen(async () => { throw new Error(message) })
  const deleteAction = ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "text-destructive")
  deleteAction.props.onClick()
  const confirm = ui.nodes(ui.render()).find(node => node.type === "Button" && node.props.variant === "destructive")
  confirm.props.onClick()
  await new Promise(setImmediate)
  const nodes = ui.nodes(ui.render())
  assert.equal(nodes.find(node => node.type === "Dialog").props.open, true)
  assert.equal(nodes.find(node => node.props?.role === "alert").props.children, message)
  assert.deepEqual(ui.notices, [message])
})
test("successful confirmed deletion closes the dialog and reports success", async () => {
  const calls = []
  const ui = screen(async (...args) => { calls.push(args) })
  ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "text-destructive").props.onClick()
  ui.nodes(ui.render()).find(node => node.type === "Button" && node.props.variant === "destructive").props.onClick()
  await new Promise(setImmediate)
  assert.equal(ui.nodes(ui.render()).find(node => node.type === "Dialog").props.open, false)
  assert.deepEqual(calls, [["role", "physician", false]])
  assert.deepEqual(ui.notices, ["Deleted"])
})

 test("blocked deletion identifies the case and expert and links to their records", async () => {
  const ui = screen(async () => { throw new BlockedError("In use", [
    { id: "assignment", label: "Case: Autism & ADHD", detail: "Assigned expert: Hala aref", href: "/dashboard/admin/cases/653xglz46cjoevs" },
    { id: "profile", label: "Expert profile: Ahmed", href: "/dashboard/admin/experts/expert" },
  ], 2) })
  ui.nodes(ui.render()).find(node => node.type === "button" && node.props.className === "text-destructive").props.onClick()
  ui.nodes(ui.render()).find(node => node.type === "Button" && node.props.variant === "destructive").props.onClick()
  await new Promise(setImmediate)
  const nodes = ui.nodes(ui.render())
  const links = nodes.filter(node => node.type === "a")
  assert.equal(links[0].props.children, "Case: Autism & ADHD")
  assert.equal(links[0].props.href, "/dashboard/admin/cases/653xglz46cjoevs")
  assert.equal(links[1].props.href, "/dashboard/admin/experts/expert")
  assert.ok(nodes.some(node => node.props?.children === "Assigned expert: Hala aref"))
 })
