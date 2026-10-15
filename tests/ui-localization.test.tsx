import { test } from "node:test"
import assert from "node:assert/strict"
import { renderToStaticMarkup } from "react-dom/server"
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { LangProvider } from "../lib/lang-context"
import { ProgramForm } from "../components/training/ProgramForm"
import { LectureForm } from "../components/lectures/LectureForm"
import { LocalizedText } from "../components/LocalizedText"
import type { Lang } from "../types/form"

const router = {
  back() {}, forward() {}, refresh() {}, push() {}, replace() {},
  async prefetch() {},
} as AppRouterInstance

function render(lang: Lang, children: React.ReactNode) {
  return renderToStaticMarkup(
    <AppRouterContext.Provider value={router}>
      <LangProvider initialLang={lang}>{children}</LangProvider>
    </AppRouterContext.Provider>
  )
}

test("Arabic training form translates controls while preserving entered bilingual content", () => {
  const html = render("ar", <ProgramForm
    initialData={{ title: { en: "Health Training", ar: "برنامج الصحة" }, type: "online", status: "published" }}
    onSubmit={() => {}} onCancel={() => {}}
  />)
  for (const label of ["المعلومات الأساسية", "معلومات المدرب", "الجدول والإعدادات", "الإظهار للعامة", "حفظ البرنامج"]) {
    assert.ok(html.includes(label), label)
  }
  for (const label of ["Basic Information", "Trainer Information", "Schedule &amp; Settings", "Save Program"]) assert.ok(!html.includes(label), label)
  assert.ok(html.includes('dir="rtl"'))
  assert.match(html, /id="titleEn"[^>]*dir="ltr"/)
  assert.ok(html.includes('value="Health Training"'))
  assert.ok(html.includes('value="برنامج الصحة"'))
})

test("Arabic lecture form localizes submit override, placeholders and visibility description", () => {
  const html = render("ar", <LectureForm initialData={{ status: "published" }} submitLabel="Save Program" onSubmit={async () => {}} onCancel={() => {}} />)
  for (const label of ["معلومات المتحدث", "الوصف (بالإنجليزية)", "أدخل عنوان المحاضرة بالإنجليزية", "إظهار هذه المحاضرة في صفحة المحاضرات العامة", "حفظ البرنامج"]) assert.ok(html.includes(label), label)
  assert.ok(!html.includes("Speaker Information"))
})

test("English forms keep English interface text and pending action states", () => {
  const html = render("en", <><ProgramForm onSubmit={() => {}} onCancel={() => {}} /><LectureForm isSubmitting onSubmit={async () => {}} onCancel={() => {}} /></>)
  for (const label of ["Basic Information", "Trainer Information", "Speaker Information", "Save Program", "Saving..."]) assert.ok(html.includes(label), label)
  assert.ok(html.includes('dir="ltr"'))
  assert.ok(!html.includes("المعلومات الأساسية"))
})

test("server page labels follow the interface language", () => {
  assert.equal(render("ar", <LocalizedText text="Coming Soon" />), "قريبًا")
  assert.equal(render("en", <LocalizedText text="Coming Soon" />), "Coming Soon")
})
