import { test } from "node:test"
import assert from "node:assert/strict"
import { canonicalPortalHref, canonicalPortalId } from "../lib/portal-routing"
import { sanitizeCmsContent } from "../lib/sanitize"

test("merged portal links preserve language, query and fragment", () => {
  for (const prefix of ["/", "/ar/", "/en/", "https://dsc.ac/", "https://www.dsc.ac/en/", ""]) {
    assert.equal(canonicalPortalHref(`${prefix}portal/3?from=programmes#services`), `${prefix}portal/4?from=programmes#services`)
  }
  assert.equal(canonicalPortalId("3"), "4")
  assert.equal(canonicalPortalId("1"), "1")
})
test("other portal IDs and external sites remain unchanged", () => {
  for (const href of ["/portal/30", "/portal/4", "https://example.com/portal/3", "/portal/3-extra"]) assert.equal(canonicalPortalHref(href), href)
})
test("legacy CMS links point directly to the merged portal in rendered HTML", () => {
  const html = sanitizeCmsContent('<p><a href="/portal/3">Innovation</a></p>')
  assert.match(html, /href="\/portal\/4"/)
  assert.doesNotMatch(html, /href="\/portal\/3"/)
})
