const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")

function load(file, mocks, globals = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  new Function("exports", "require", ...Object.keys(globals), code)(exports, name => {
    assert.ok(name in mocks, `Unexpected dependency: ${name}`)
    return mocks[name]
  }, ...Object.values(globals))
  return exports
}

function hooks() {
  const slots = []
  let cursor = 0, pending = []
  const changed = (old, deps) => !old || deps.some((value, i) => value !== old.deps[i])
  const react = {
    useState(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial
      return [slots[i], value => { slots[i] = typeof value === "function" ? value(slots[i]) : value }]
    },
    useCallback(fn, deps) {
      const i = cursor++
      if (changed(slots[i], deps)) slots[i] = { deps, fn }
      return slots[i].fn
    },
    useEffect(fn, deps) {
      const i = cursor++
      if (changed(slots[i], deps)) pending.push(() => {
        slots[i]?.cleanup?.()
        slots[i] = { deps, cleanup: fn() }
      })
    },
  }
  return {
    react,
    render(fn) { cursor = 0; return fn() },
    flush() { const effects = pending; pending = []; effects.forEach(fn => fn()) },
    unmount() { slots.forEach(slot => slot?.cleanup?.()) },
  }
}
const settle = () => new Promise(resolve => setImmediate(resolve))
const nodes = tree => !tree || typeof tree !== "object" ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)]

test("media and multiple-choice previews expose native video playback controls", () => {
  for (const component of ["MediaPreview", "MultipleChoicePreview"]) {
    const h = hooks()
    const jsx = (type, props) => ({ type, props })
    const mocks = {
      react: h.react,
      "react/jsx-runtime": { jsx, jsxs: jsx },
      "@/hooks/useUiTranslation": { useUiTranslation: () => text => text },
      "@/lib/lang-context": { useLang: () => ({ lang: "en" }) },
    }
    for (const [path, names] of Object.entries({
      card: ["Card", "CardContent"], input: ["Input"], label: ["Label"],
      "radio-group": ["RadioGroup", "RadioGroupItem"], checkbox: ["Checkbox"],
      badge: ["Badge"], button: ["Button"],
    })) mocks["@/components/ui/" + path] = Object.fromEntries(names.map(name => [name, name]))
    mocks["../ui/textarea"] = { Textarea: "Textarea" }
    const Preview = load(`components/tool-renderers/${component}.tsx`, mocks)[component]
    const item = { id: "video", order: 0, answerType: "media", responseType: "text", mediaType: "video", mediaUrl: "https://files.test/video.mp4" }
    const tree = h.render(() => Preview({ config: { title: { en: "Preview", ar: "معاينة" }, items: [item], questions: [item] } }))
    const video = nodes(tree).find(node => node.type === "video")
    assert.equal(video.props.controls, true)
    assert.equal(video.props.playsInline, true)
  }
})

test("file previews allocate outside render, survive rerenders and release replaced files and unmounts", () => {
  const h = hooks(), created = [], revoked = []
  const { useFilePreviewUrls } = load("hooks/useFilePreviewUrls.ts", { react: h.react }, {
    URL: { createObjectURL(file) { created.push(file); return `blob:${created.length}` }, revokeObjectURL(url) { revoked.push(url) } },
  })
  const first = new File(["one"], "one.png"), second = new File(["two"], "two.png")
  let files = new Map([["question", first]])
  const render = () => h.render(() => useFilePreviewUrls(files))
  assert.equal(render().size, 0)
  assert.equal(created.length, 0)
  h.flush()
  assert.equal(render().get("question"), "blob:1")
  h.flush(); render(); h.flush()
  assert.equal(created.length, 1)
  files = new Map([["question", second]])
  assert.equal(render().has("question"), false, "a replaced file must not display its old preview")
  h.flush()
  assert.deepEqual(revoked, ["blob:1"])
  assert.equal(render().get("question"), "blob:2")
  h.unmount()
  assert.deepEqual(revoked, ["blob:1", "blob:2"])
})

test("unread badges isolate accounts and ignore superseded polling responses", async () => {
  const h = hooks(), pending = [], listeners = new Set()
  const { useUnreadMessages } = load("hooks/useUnreadMessages.ts", {
    react: h.react,
    "@/lib/pb": { __esModule: true, default: {
      filter: (_query, params) => params.id,
      collection: () => ({ getList: (_page, _size, options) => new Promise(resolve => pending.push({ user: options.filter, resolve })) }),
    } },
  }, {
    window: { addEventListener: (_event, fn) => listeners.add(fn), removeEventListener: (_event, fn) => listeners.delete(fn) },
    setInterval: () => 1, clearInterval() {},
  })
  const render = (user, enabled = true) => h.render(() => useUnreadMessages(user, enabled))
  assert.equal(render("first"), 0); h.flush()
  pending.shift().resolve({ totalItems: 8 }); await settle()
  assert.equal(render("first"), 8)
  assert.equal(render("second"), 0); h.flush()
  const old = pending.shift()
  const newer = [...listeners][0]()
  pending.shift().resolve({ totalItems: 2 }); await newer
  old.resolve({ totalItems: 99 }); await settle()
  assert.equal(render("second"), 2)
  assert.equal(render(undefined), 0); h.flush()
  assert.equal(listeners.size, 0)
  h.unmount()
})

test("CMS list failures show retry, and a late older response cannot replace newer pages", async () => {
  const h = hooks(), pending = []
  const jsx = (type, props) => ({ type, props })
  const primitives = names => Object.fromEntries(names.map(name => [name, name]))
  let generation = 0
  const begin = () => { const request = ++generation; return () => request === generation }
  const { default: Page } = load("app/cms/home-pages/page.tsx", {
    react: h.react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "@/hooks/usePermissions": { usePermissions: () => ({ can: () => true }) },
    "@/hooks/useRequestGuard": { useRequestGuard: () => begin },
    "@/hooks/useAuth": { useAuth: () => ({ isSuperAdmin: false }) },
    "@/lib/bounded-records": { boundedFullList: () => new Promise((resolve, reject) => pending.push({ resolve, reject })) },
    "@/lib/pb": { __esModule: true, default: { collection: () => ({}) }, getErrorMessage: error => error.message },
    "@/lib/pb-collections": { homePagesCollection: {} },
    "@/lib/format-date": { formatDate: () => "date" },
    "@/lib/lang-context": { useLang: () => ({ lang: "en" }) },
    "@/lib/i18n": { t: (text, lang) => text[lang], UI_STRINGS: {
      cancel: { en: "Cancel" }, published: { en: "Published" }, draft: { en: "Draft" },
    } },
    "next/link": { __esModule: true, default: "Link" },
    "lucide-react": new Proxy({}, { get: (_target, name) => name }),
    sonner: { toast: { error() {} } },
    "@/components/ui/button": primitives(["Button"]),
    "@/components/ui/input": primitives(["Input"]),
    "@/components/ui/label": primitives(["Label"]),
    "@/components/ui/badge": primitives(["Badge"]),
    "@/components/ui/table": primitives(["Table", "TableBody", "TableCell", "TableHead", "TableHeader", "TableRow"]),
  })
  const render = () => h.render(Page)
  render(); h.flush()
  pending.shift().reject(Error("Backend unavailable")); await settle()
  const error = nodes(render()).find(node => node.props?.role === "alert")
  assert.match(JSON.stringify(error), /Unable to load pages.*Backend unavailable/)
  const retry = nodes(error).find(node => node.type === "Button")
  retry.props.onClick(); retry.props.onClick()
  const old = pending.shift(), latest = pending.shift()
  latest.resolve([{ id: "latest", slug: "latest", title_en: "Latest page", is_published: true }]); await settle()
  old.resolve([{ id: "stale", slug: "stale", title_en: "Stale page" }]); await settle()
  assert.match(JSON.stringify(render()), /Latest page/)
  assert.doesNotMatch(JSON.stringify(render()), /Stale page/)
})
