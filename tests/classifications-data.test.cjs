const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")

test("classification selectors use persisted names and custom keys instead of resurrecting deleted defaults", async () => {
  const records = [{ id: "custom-id", key: "custom-topic", name_en: "Edited name", name_ar: "اسم معدل", is_active: true }]
  const exports = {}
  const mocks = {
    "@/lib/pb": { __esModule: true, default: { collection: name => name } },
    "@/lib/bounded-records": { boundedFullList: async name => { assert.equal(name, "specialist_role_categories"); return records } },
    "@/lib/classification": { mainCategoryKey: key => key === "psychology" ? "mental-health" : key },
  }
  new Function("exports", "require", ts.transpileModule(fs.readFileSync("lib/classifications-data.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText)(exports, name => { assert.ok(name in mocks, name); return mocks[name] })
  const result = await exports.getClassificationDefinitions()
  assert.equal(result.length, 1)
  assert.equal(result[0].en, "Edited name")
  assert.equal(result[0].ar, "اسم معدل")
  assert.equal(result[0].key, "custom-topic")
  assert.equal(result.some(c => c.key === "research"), false)
  records.length = 0
  assert.deepEqual(await exports.getClassificationDefinitions(), [])
})
