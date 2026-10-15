import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import { DomUtils, parseDocument } from "htmlparser2"
import {
  buildCmsLayoutDocument,
  cmsLayoutSource,
  isCustomCmsLayout,
  storeCmsLayout,
  CMS_LAYOUT_SANDBOX,
} from "../lib/cms-layout"
import { sanitizeCmsContent } from "../lib/sanitize"

const example = fs.readFileSync(
  new URL("./fixtures/custom-cms-layout.html", import.meta.url),
  "utf8"
)

test("the supplied complete Arabic page preserves CSS variables, media queries and structure", () => {
  const html = buildCmsLayoutDocument(example, "ar")
  assert.ok(html.includes("--navy: #183b50"))
  assert.ok(html.includes("grid-template-columns: repeat(2, 1fr)"))
  assert.ok(html.includes("@media (max-width: 768px)"))
  assert.ok(html.includes("@media (max-width: 400px)"))
  assert.ok(html.includes('class="two-columns"'))
  assert.ok(html.includes("من نحن؟"))
  assert.ok(html.includes('<html lang="ar" dir="rtl">'))
  assert.equal((html.match(/<html\b/g) ?? []).length, 1)
  assert.equal((html.match(/<body\b/g) ?? []).length, 1)
  // The source document's metadata title must not turn into visible body text.
  assert.ok(!html.includes("من نحن | استشارية أسرار التطور DSC"))
})

test("custom source round-trips exactly through the existing CMS content field", () => {
  const stored = storeCmsLayout(example)
  assert.equal(cmsLayoutSource(stored), example)
  assert.equal(storeCmsLayout(stored), stored)
  assert.ok(isCustomCmsLayout(stored))
  assert.ok(isCustomCmsLayout(example))
  assert.ok(
    isCustomCmsLayout(
      '<style>.card{display:grid}</style><div class="card">Test</div>'
    )
  )
  assert.ok(!isCustomCmsLayout("<p>Normal rich text</p>"))
  assert.ok(!isCustomCmsLayout("<pre>&lt;style&gt;example&lt;/style&gt;</pre>"))
})

test("inline layout styles and body/html attributes survive inside the isolated document", () => {
  const html = buildCmsLayoutDocument(
    '<html lang="en" style="--accent:gold"><head></head><body class="layout" style="padding:24px"><div style="display:grid;gap:16px;color:var(--accent)">Content</div></body></html>',
    "ar"
  )
  assert.ok(html.includes('lang="en"'))
  assert.ok(html.includes('style="--accent:gold"'))
  assert.ok(html.includes('<body class="layout" style="padding:24px">'))
  assert.ok(html.includes('style="display:grid;gap:16px;color:var(--accent)"'))
})

test("active content, navigation metadata, forms and event handlers are removed", () => {
  const html = buildCmsLayoutDocument(
    `<html onload="alert(1)"><head><meta http-equiv="refresh" content="0;url=https://example.com"><base href="https://example.com"><link rel="stylesheet" href="https://example.com/a.css"></head><body onload="alert(2)"><script>alert(3)</script><img src="x" onerror="alert(4)"><iframe src="https://example.com"></iframe><form action="/api/send"><input name="x"></form><a href="javascript:alert(5)">bad</a><div onclick="alert(6)">Text</div></body></html>`,
    "en"
  )
  assert.ok(!html.includes("alert("))
  assert.ok(!/<(?:script|iframe|form|input|base|link)\b/i.test(html))
  assert.ok(!html.includes('http-equiv="refresh"'))
  assert.ok(!/on(?:load|error|click)=/i.test(html))
  assert.ok(
    html.includes("script-src &#39;none&#39;") ||
      html.includes("script-src 'none'")
  )
  assert.ok(!CMS_LAYOUT_SANDBOX.split(" ").includes("allow-scripts"))
  assert.ok(!CMS_LAYOUT_SANDBOX.split(" ").includes("allow-top-navigation"))
})

test("custom content cannot supply a permissive CSP or replace the renderer's document head", () => {
  const html = buildCmsLayoutDocument(
    '<meta http-equiv="Content-Security-Policy" content="default-src *"><style>body{background:white}</style><p>Safe</p>',
    "en"
  )
  const document = parseDocument(html)
  const policies = DomUtils.getElementsByTagName(
    "meta",
    document.children,
    true
  ).filter(
    (element) => element.attribs["http-equiv"] === "Content-Security-Policy"
  )
  assert.equal(policies.length, 1)
  assert.ok(policies[0].attribs.content.includes("script-src 'none'"))
  assert.ok(policies[0].attribs.content.includes("form-action 'none'"))
})

test("anchors retain safe navigation and rich-text sanitization remains strict", () => {
  const html = buildCmsLayoutDocument(
    '<a href="#vision">Vision</a><a href="https://example.com" target="_top">External</a>',
    "en"
  )
  assert.ok(html.includes('href="#vision" target="_self"'))
  assert.ok(html.includes('href="https://example.com" target="_blank"'))
  assert.ok(!html.includes('target="_top"'))
  assert.ok(html.includes('rel="noopener noreferrer"'))
  const rich = sanitizeCmsContent(
    '<style>body{display:none}</style><p style="display:grid;color:#123456">Text</p>'
  )
  assert.ok(!rich.includes("<style>"))
  assert.ok(!rich.includes("display:grid"))
  assert.ok(rich.includes("color:#123456"))
})
