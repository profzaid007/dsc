const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")

function screen(type, saveResult = { id: "saved" }) {
  const state = [], fetched = [], saved = []
  let index = 0
  const jsx = (type, props) => ({ type, props })
  const components = names => Object.fromEntries(names.map(name => [name, name]))
  const mocks = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState(initial) { const i = index++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = typeof value === "function" ? value(state[i]) : value }] },
      useEffect: effect => effect(),
    },
    "next/navigation": { useRouter: () => ({ push() {} }) },
    "@/hooks/useUiTranslation": { useUiTranslation: () => text => text },
    "@/hooks/usePermissions": { usePermissions: () => ({ isLoading: false, can: () => true }) },
    "@/lib/lang-context": { useLang: () => ({ lang: "en" }) },
    "@/lib/format-date": { formatDate: () => "date" },
    "lucide-react": new Proxy({}, { get: (_, key) => key }),
    "@/components/ui/card": components(["Card", "CardHeader", "CardTitle", "CardContent"]),
    "@/components/ui/button": components(["Button"]),
    "@/components/ui/input": components(["Input"]),
    "@/components/ui/label": components(["Label"]),
    "@/components/ui/table": components(["Table", "TableBody", "TableCell", "TableHead", "TableHeader", "TableRow"]),
    "@/components/ui/dialog": components(["Dialog", "DialogContent", "DialogFooter", "DialogHeader", "DialogTitle"]),
    "@/hooks/useLookups": { useLookups: () => ({
      lookups: [
        { id: "tool", type: "tool_types", key: "survey", label_en: "Tool-only value", label_ar: "أداة" },
        { id: "user", type: "user_types", key: "expert", label_en: "User-only value", label_ar: "خبير" },
      ], isLoading: false, error: "", fetchLookups: async value => { fetched.push(value) },
      createLookup: async data => { saved.push(data); return saveResult },
      updateLookup: async () => saveResult, deleteLookup: async () => true,
    }) },
  }
  const exports = {}
  new Function("exports", "require", ts.transpileModule(fs.readFileSync("components/settings/LookupSettings.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText)(exports, name => { assert.ok(name in mocks, name); return mocks[name] })
  const render = () => { index = 0; return exports.LookupSettings({ type }) }
  const nodes = tree => !tree || typeof tree !== "object" ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)]
  return { render, nodes, fetched, saved }
}

test("each list fetches and renders only its fixed lookup type", () => {
  for (const type of ["tool_types", "user_types"]) {
    const ui = screen(type)
    const body = ui.nodes(ui.render()).find(node => node.type === "TableBody")
    const cells = ui.nodes(body).filter(node => node.type === "TableCell").map(node => node.props.children)
    assert.ok(cells.includes(type === "tool_types" ? "Tool-only value" : "User-only value"))
    assert.ok(!cells.includes(type === "tool_types" ? "User-only value" : "Tool-only value"))
    assert.deepEqual(ui.fetched, [type])
  }
})

test("new records are saved into their page's group; failed writes keep the dialog open", async () => {
  for (const type of ["tool_types", "user_types"]) {
    const ui = screen(type, null)
    ui.nodes(ui.render()).find(node => node.type === "Button" && node.props.children?.[1] === "Add Lookup").props.onClick()
    const inputs = ui.nodes(ui.render()).filter(node => node.type === "Input")
    for (const [i, value] of ["custom-key", "Custom value", "قيمة"].entries()) inputs[i].props.onChange({ target: { value } })
    await ui.nodes(ui.render()).find(node => node.type === "Button" && node.props.children === "Create").props.onClick()
    assert.equal(ui.saved[0].type, type)
    assert.equal(ui.nodes(ui.render()).find(node => node.type === "Dialog").props.open, true)
  }
})
