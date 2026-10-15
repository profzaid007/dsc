import { test } from "node:test"
import assert from "node:assert/strict"
import {
  cmsContentPayload,
  CmsSaveVerificationError,
  saveCmsPageVerified,
} from "../lib/cms-save"
import { cmsLayoutSource, storeCmsLayout } from "../lib/cms-layout"

test("saving one language also persists edits made in the other tab", () => {
  assert.deepEqual(
    cmsContentPayload(
      "en",
      "Latest English buffer",
      "Previous English",
      "Arabic draft"
    ),
    {
      content_en: "Latest English buffer",
      content_ar: "Arabic draft",
    }
  )
  assert.deepEqual(
    cmsContentPayload(
      "ar",
      "Latest Arabic buffer",
      "English draft",
      "Previous Arabic"
    ),
    {
      content_en: "English draft",
      content_ar: "Latest Arabic buffer",
    }
  )
})

test("HTML/CSS remains intact after verified save and a fresh load", async () => {
  const source =
    '<style>.section{display:grid;gap:18px}</style><section class="section">من نحن</section>'
  const expected = cmsContentPayload(
    "ar",
    storeCmsLayout(source),
    "<p>English draft</p>",
    ""
  )
  let database = { id: "page1", content_en: "", content_ar: "" }
  const operations: string[] = []
  const result = await saveCmsPageVerified(
    async () => {
      operations.push("write")
      database = { id: "page1", ...expected }
      return database
    },
    async (id) => {
      operations.push(`read:${id}`)
      return { ...database }
    },
    expected
  )
  assert.deepEqual(operations, ["write", "read:page1"])
  assert.equal(cmsLayoutSource(result.content_ar), source)
  assert.equal(result.content_en, "<p>English draft</p>")
})

test("a successful update response followed by unchanged stored data is not reported as saved", async () => {
  const expected = { content_en: "New English", content_ar: "New Arabic" }
  await assert.rejects(
    saveCmsPageVerified(
      async () => ({ id: "page1", ...expected }),
      async () => ({
        id: "page1",
        content_en: "Old English",
        content_ar: "Old Arabic",
      }),
      expected
    ),
    CmsSaveVerificationError
  )
})

test("write and verification read failures propagate without replacing the draft", async () => {
  const expected = { content_en: "Draft", content_ar: "مسودة" }
  let reads = 0
  await assert.rejects(
    saveCmsPageVerified(
      async () => {
        throw new Error("Denied")
      },
      async () => {
        reads++
        return { id: "page1", ...expected }
      },
      expected
    ),
    /Denied/
  )
  assert.equal(reads, 0)
  await assert.rejects(
    saveCmsPageVerified(
      async () => ({ id: "page1", ...expected }),
      async () => {
        throw new Error("Offline")
      },
      expected
    ),
    /Offline/
  )
  assert.deepEqual(expected, { content_en: "Draft", content_ar: "مسودة" })
})

test("verification accepts only harmless outer whitespace and CRLF normalization", async () => {
  const expected = {
    content_en: "\n<p>Content</p>\r\n",
    content_ar: "<p>عربي</p>",
  }
  const result = await saveCmsPageVerified(
    async () => ({ id: "page1", ...expected }),
    async () => ({
      id: "page1",
      content_en: "<p>Content</p>\n",
      content_ar: expected.content_ar,
    }),
    expected
  )
  assert.equal(result.id, "page1")
})
