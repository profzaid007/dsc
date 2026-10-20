import { test } from "node:test"
import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { renderToStaticMarkup } from "react-dom/server"
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime"
import { DomUtils, parseDocument } from "htmlparser2"
import { LangProvider } from "../lib/lang-context"
import { storeCmsLayout } from "../lib/cms-layout"

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".css"))
      return {
        format: "module",
        shortCircuit: true,
        source: "export default {}",
      }
    return nextLoad(url, context)
  },
})
const { CmsContent } = await import("../components/cms/CmsContent")
const { RichTextEditor } = await import("../components/cms/RichTextEditor")
const source =
  '<style>:root{--gold:#b58a51}body{background:#f5f6f8}.cards{display:grid;gap:18px}</style><section class="cards">من نحن</section>'

test("custom content renders inside the sandbox, with CSS absent from the host document", () => {
  const markup = renderToStaticMarkup(
    <CmsContent html={storeCmsLayout(source)} lang="ar" />
  )
  const tree = parseDocument(markup)
  const frames = DomUtils.getElementsByTagName("iframe", tree.children, true)
  assert.equal(frames.length, 1)
  assert.ok(frames[0].attribs.srcdoc.includes("display:grid"))
  assert.ok(!frames[0].attribs.sandbox.split(" ").includes("allow-scripts"))
  assert.equal(
    DomUtils.getElementsByTagName("style", tree.children, true).length,
    0
  )
  assert.equal(
    DomUtils.getElementsByTagName("section", tree.children, true).length,
    0
  )
})

test("ordinary rich text retains its existing host rendering and sanitizer", () => {
  const markup = renderToStaticMarkup(
    <CmsContent
      html='<p style="display:grid;color:#123456">Existing text</p>'
      lang="en"
    />
  )
  assert.ok(markup.includes("Existing text"))
  assert.ok(markup.includes("cms-rendered"))
  assert.ok(!markup.includes("<iframe"))
  assert.ok(!markup.includes("display:grid"))
})

test("reopening a stored layout selects custom mode and exposes the unchanged source", () => {
  const router = {
    bfcacheId: "test",
    refresh() {},
    push() {},
    replace() {},
    back() {},
    forward() {},
    async prefetch() {},
  } as AppRouterInstance
  const markup = renderToStaticMarkup(
    <AppRouterContext.Provider value={router}>
      <LangProvider initialLang="en">
        <RichTextEditor
          initialContent={storeCmsLayout(source)}
          title="Content"
          direction="rtl"
          isSaving={false}
          onSave={async () => {}}
        />
      </LangProvider>
    </AppRouterContext.Provider>
  )
  const tree = parseDocument(markup)
  const textareas = DomUtils.getElementsByTagName(
    "textarea",
    tree.children,
    true
  )
  assert.equal(textareas.length, 1)
  assert.equal(DomUtils.textContent(textareas[0]), source)
  const custom = DomUtils.getElementsByTagName(
    "button",
    tree.children,
    true
  ).find((button) =>
    DomUtils.textContent(button).includes("Custom HTML/CSS layout")
  )
  assert.equal(custom?.attribs["aria-pressed"], "true")
  assert.ok(markup.includes("Custom layout preview"))
})
