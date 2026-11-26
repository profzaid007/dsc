import { test } from "node:test"
import assert from "node:assert/strict"
import { PAGE_TITLE_MAP, formatPageTitle, recordPageTitle } from "../lib/page-titles"
import { readFileSync } from "node:fs"
import vm from "node:vm"

test("titles contain only the authored topic and exactly one DSC suffix", () => {
  assert.equal(formatPageTitle("التوحد"), "التوحد | DSC")
  assert.equal(formatPageTitle("ADHD"), "ADHD | DSC")
  assert.equal(formatPageTitle("  Autism  | DSC | DSC "), "Autism | DSC")
  assert.equal(formatPageTitle("Understanding autism"), "Understanding autism | DSC")
})
test("keyword map gives static pages distinct bilingual titles without location or delivery additions", () => {
  for (const lang of ["ar", "en"] as const) {
    const titles = Object.values(PAGE_TITLE_MAP).map(value => formatPageTitle(value[lang]))
    assert.equal(new Set(titles).size, titles.length)
    for (const title of titles) assert.doesNotMatch(title, /عمّان|عمان|Amman|online|أونلاين/i)
  }
})
test("content titles support CMS fields, lecture JSON and training JSON", () => {
  assert.equal(recordPageTitle({title_ar: "فرط الحركة", title_en: "ADHD"}, "ar"), "فرط الحركة")
  assert.equal(recordPageTitle({title: {ar: "محاضرة", en: "Lecture"}}, "ar"), "محاضرة")
  assert.equal(recordPageTitle({name: {ar: "دورة", en: "Course"}}, "ar"), "دورة")
})
test("database migration is mirrored and restricts writes to active CMS grants", () => {
  const source = readFileSync(new URL("../pb_migrations/1796500000_page_seo.js", import.meta.url), "utf8")
  assert.equal(source, readFileSync(new URL("../backend/pb/pb_migrations/1796500000_page_seo.js", import.meta.url), "utf8"))
  let collection: Record<string, unknown> | undefined
  class Definition { constructor(value: object) { Object.assign(this, value) } }
  class CollectionDefinition extends Definition {
    fields = { values: [] as unknown[], add(value: unknown) { this.values.push(value) } }
  }
  vm.runInNewContext(source, { Collection: CollectionDefinition, TextField: Definition, migrate(up: (app: object) => void) { up({ save(value: Record<string, unknown>) { collection = value } }) } })
  assert.ok(collection)
  assert.equal(collection.listRule, "")
  for (const action of ["create", "update", "delete"]) {
    assert.match(String(collection[`${action}Rule`]), /is_active = true/)
    assert.ok(String(collection[`${action}Rule`]).includes(`cms.${action}`))
  }
  assert.equal((collection.indexes as string[]).length, 3)
  assert.equal((collection.fields as CollectionDefinition["fields"]).values.length, 3)
})
