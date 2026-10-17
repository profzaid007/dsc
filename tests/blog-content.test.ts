import assert from "node:assert/strict"
import test from "node:test"
import { blogField, blogContentLang, blogContentPayload, blogPlainText, assertBlogClassificationSchema } from "../lib/blog-content"

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
