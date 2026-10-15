import assert from "node:assert/strict"
import test from "node:test"
import { blogField, blogContentLang, blogContentPayload } from "../lib/blog-content"

test("a single authored version reads the same in both interface languages", () => {
  const saved = blogContentPayload("عنوان عربي", "<p>نص عربي</p>")
  assert.equal(blogField(saved, "title"), "عنوان عربي")
  assert.equal(saved.content_en, saved.content_ar)
  assert.equal(blogField({ ...saved, ...blogContentPayload("عنوان", "") }, "content"), "")
})

test("legacy Arabic-only posts remain editable and primary versions stay consistent", () => {
  assert.equal(blogField({ content_ar: "قديم" }, "content"), "قديم")
  assert.equal(blogField({ content_en: "Original", content_ar: "ترجمة" }, "content"), "Original")
})

test("writing direction follows content rather than interface language or HTML markup", () => {
  assert.equal(blogContentLang('<p class="english">مرحبا Hello</p>'), "ar")
  assert.equal(blogContentLang("<p>Hello مرحبا</p>"), "en")
})
