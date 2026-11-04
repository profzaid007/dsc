import assert from "node:assert/strict"
import test from "node:test"
import { blogField, blogContentLang, blogContentPayload, blogPlainText, assertBlogClassificationSchema, publicBlogField } from "../lib/blog-content"

test("a single authored version reads the same in both interface languages", () => {
  const saved = blogContentPayload("عنوان عربي", "<p>نص عربي</p>")
  assert.equal(blogField(saved, "title"), "عنوان عربي")
  assert.deepEqual(saved, { title: "عنوان عربي", content: "<p>نص عربي</p>" })
  assert.equal(blogField({ ...saved, ...blogContentPayload("عنوان", "") }, "content"), "")
})

test("missing canonical fields are reported instead of reading old language copies", () => {
  assert.throws(() => blogField({} as {content?: string}, "content"), /Update the blog database schema/)
  assert.equal(blogField({content: ""}, "content"), "")
  assert.deepEqual(blogContentPayload("English عنوان", "<p>Mixed نص</p>"), {title: "English عنوان", content: "<p>Mixed نص</p>"})
})

test("published legacy posts render the requested authored version without changing stored values", () => {
  const legacy = { title_ar: "عنوان أصلي", title_en: "Original title", content_ar: "<p>نص أصلي</p>", content_en: "<p>Original text</p>" }
  const before = { ...legacy }
  assert.equal(publicBlogField(legacy, "title", "ar"), "عنوان أصلي")
  assert.equal(publicBlogField(legacy, "title", "en"), "Original title")
  assert.equal(publicBlogField(legacy, "content", "ar"), "<p>نص أصلي</p>")
  assert.equal(publicBlogField(legacy, "content", "en"), "<p>Original text</p>")
  assert.deepEqual(legacy, before)
})

test("published canonical fields stay authoritative in either language, even after intentionally clearing content", () => {
  const canonical = { title: "Authored title", content: "", title_ar: "عنوان قديم", content_en: "Old content" }
  for (const lang of ["ar", "en"] as const) {
    assert.equal(publicBlogField(canonical, "title", lang), "Authored title")
    assert.equal(publicBlogField(canonical, "content", lang), "")
  }
})

test("legacy public reading handles missing translations without weakening canonical write validation", () => {
  assert.equal(publicBlogField({ content_ar: "<p>مقال</p>" }, "content", "en"), "<p>مقال</p>")
  assert.equal(publicBlogField({ title_ar: "", title_en: "Title" }, "title", "ar"), "Title")
  assert.equal(publicBlogField({}, "content", "ar"), "")
  assert.throws(() => blogField({} as { content?: string }, "content"), /Update the blog database schema/)
  assert.deepEqual(blogContentPayload("Title", "Text"), { title: "Title", content: "Text" })
})

test("writing direction follows content rather than interface language or HTML markup", () => {
  assert.equal(blogContentLang('<p class="english">مرحبا Hello</p>'), "ar")
  assert.equal(blogContentLang("<p>Hello مرحبا</p>"), "en")
})

test("HTML article summaries omit CSS, scripts, metadata and comments while preserving article text", () => {
  const source = `<!--dsc:custom-layout:v1--><!DOCTYPE html><html><head><title>Metadata</title><style>body{margin:0;background:var(--navy)} @media(max-width:900px){aside{display:none}}</style></head><body><script>window.print()</script><h1>مقال تعليمي</h1><p>النص <strong>الأصلي</strong> &amp; البحث&nbsp;العلمي &#x627;</p><template>Template text</template><span hidden>Hidden text</span></body></html>`
  assert.equal(blogPlainText(source), "مقال تعليمي النص الأصلي & البحث العلمي ا")
  assert.equal(blogContentLang(source), "ar")
})

test("summaries preserve paragraph separation and render encoded markup as text", () => {
  assert.equal(blogPlainText('<p>First</p><p>Second &lt;example&gt; &#38; third</p>'), 'First Second <example> & third')
  assert.equal(blogPlainText(''), '')
  assert.equal(blogPlainText('<style>p{color:red}</style><p>Visible'), 'Visible')
})

test("old backend schema cannot silently discard selected classification and keywords", () => {
  assert.throws(() => assertBlogClassificationSchema({category:"autism"}), /Update the server database/)
  assert.throws(() => assertBlogClassificationSchema({main_category:"medical"}), /Update the server database/)
  assert.doesNotThrow(() => assertBlogClassificationSchema({main_category:"", keywords:""}))
})
