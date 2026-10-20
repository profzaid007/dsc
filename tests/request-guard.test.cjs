const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  ts = require("typescript")
function harness() {
  const store = { record: { id: "first" }, token: "first-token" },
    slots = []
  let index = 0,
    pending = []
  const react = {
    useSyncExternalStore(_subscribe, snapshot) {
      return snapshot()
    },
    useRef(initial) {
      const i = index++
      return (slots[i] ||= { current: initial })
    },
    useCallback(callback) {
      return callback
    },
    useEffect(callback, deps) {
      const i = index++,
        before = slots[i]
      if (!before || deps.some((v, j) => v !== before.deps[j])) {
        pending.push(() => {
          before?.cleanup?.()
          slots[i] = { deps, cleanup: callback() }
        })
      }
    },
  }
  const exports = {}
  const js = ts.transpileModule(
    fs.readFileSync("hooks/useRequestGuard.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }
  ).outputText
  new Function("exports", "require", js)(exports, (name) =>
    name === "react"
      ? react
      : { __esModule: true, default: { authStore: store } }
  )
  return {
    store,
    render(scope) {
      index = 0
      const begin = exports.useRequestGuard(scope)
      const effects = pending
      pending = []
      effects.forEach((run) => run())
      return begin
    },
    unmount() {
      slots.forEach((slot) => slot?.cleanup?.())
    },
  }
}
test("request guards discard superseded requests, changed scopes, changed auth and unmounted completions", () => {
  const h = harness(),
    begin = h.render("case-one"),
    first = begin(),
    second = begin()
  assert.equal(first(), false)
  assert.equal(second(), true)
  const next = h.render("case-two")
  assert.equal(second(), false)
  const current = next()
  assert.equal(current(), true)
  h.store.record = { id: "second" }
  h.store.token = "second-token"
  assert.equal(current(), false)
  const authenticated = h.render("case-two")()
  assert.equal(authenticated(), true)
  h.unmount()
  assert.equal(authenticated(), false)
})
