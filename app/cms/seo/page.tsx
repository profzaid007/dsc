"use client"
import { useEffect, useState } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import { boundedFullList } from "@/lib/bounded-records"
import { PAGE_TITLE_MAP, formatPageTitle, recordPageTitle } from "@/lib/page-titles"
import { publicBlogField } from "@/lib/blog-content"
import { useLang } from "@/lib/lang-context"
import { usePermissions } from "@/hooks/usePermissions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { RecordModel } from "pocketbase"

type Page = { path: string; ar: string; en: string }
const sources = [
  { collection: "portals", prefix: "/portal/", key: "portal_key", filter: 'is_deleted=false && portal_key != "3"' },
  { collection: "info_pages", prefix: "/info/", key: "slug", filter: "is_published=true" },
  { collection: "home_pages", prefix: "/", key: "slug", filter: "is_published=true" },
  { collection: "blog_pages", prefix: "/blog/", key: "slug", filter: "is_published=true" },
  { collection: "programs", prefix: "/programmes/training_programmes/", key: "id", filter: 'status="published" || status="in_progress" || status="completed"' },
  { collection: "public_lectures_public", prefix: "/programmes/public_lectures/", key: "id", filter: "" },
]
export default function PageTitles() {
  const { lang } = useLang()
  const permissions = usePermissions()
  const ar = lang === "ar"
  const [pages, setPages] = useState<Page[]>([])
  const [records, setRecords] = useState<RecordModel[]>([])
  const [path, setPath] = useState("/")
  const [titleAr, setTitleAr] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [loading, setLoading] = useState(true)
  const [schemaReady, setSchemaReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  useEffect(() => {
    let active = true
    async function load() {
      const options = { requestKey: null, signal: AbortSignal.timeout(10000) }
      const [seo, ...results] = await Promise.allSettled([
        boundedFullList(pb.collection("page_seo"), options),
        ...sources.map(source => boundedFullList(pb.collection(source.collection), { ...options, filter: source.filter })),
      ])
      if (!active) return
      const catalog: Page[] = Object.entries(PAGE_TITLE_MAP).map(([path, title]) => ({ path, ...title }))
      const missing: string[] = []
      results.forEach((result, index) => {
        const source = sources[index]
        if (result.status === "rejected") { missing.push(source.collection); return }
        for (const row of result.value) {
          const article = source.collection === "blog_pages"
          catalog.push({ path: `${source.prefix}${row[source.key]}`, ar: article ? publicBlogField(row, "title", "ar") : recordPageTitle(row, "ar"), en: article ? publicBlogField(row, "title", "en") : recordPageTitle(row, "en") })
        }
      })
      // Explicit static keyword mappings take precedence over CMS body headings.
      const unique = [...new Map(catalog.reverse().map(page => [page.path, page])).values()].reverse()
      setPages(unique)
      if (seo.status === "fulfilled") {
        setRecords(seo.value); setSchemaReady(true)
        const home = seo.value.find(row => row.path === "/")
        setTitleAr(home?.title_ar || ""); setTitleEn(home?.title_en || "")
      } else {
        setError(ar ? "يلزم تطبيق تحديث قاعدة البيانات page_seo وتوفر صلاحية المحتوى لحفظ العناوين. العناوين التلقائية تعمل دون هذا التحديث." : "Apply the page_seo database migration and check CMS access to save overrides. Automatic titles work without the migration.")
      }
      if (missing.length) setNotice((ar ? "تعذر تحميل بعض الصفحات: " : "Some page sources could not be loaded: ") + missing.join(", "))
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [ar])
  const selected = pages.find(page => page.path === path)
  const existing = records.find(record => record.path === path)
  const previewAr = formatPageTitle(titleAr || selected?.ar || "")
  const previewEn = formatPageTitle(titleEn || selected?.en || "")
  const duplicates = pages.filter(page => page.path !== path).some(page => {
    const record = records.find(row => row.path === page.path)
    return formatPageTitle(record?.title_ar || page.ar) === previewAr || formatPageTitle(record?.title_en || page.en).toLowerCase() === previewEn.toLowerCase()
  })
  async function save(event: React.FormEvent) {
    event.preventDefault(); setError(""); setNotice(""); setSaving(true)
    try {
      if (!schemaReady) throw new Error(ar ? "يلزم تحديث قاعدة البيانات أولًا." : "Apply the database migration first.")
      if (duplicates) throw new Error(ar ? "العنوان مكرر في صفحة أخرى. اختر عنوانًا مميزًا." : "A title matches another page. Choose a distinct title.")
      const data = { path, title_ar: titleAr.trim() ? formatPageTitle(titleAr) : "", title_en: titleEn.trim() ? formatPageTitle(titleEn) : "" }
      const record = existing ? await pb.collection("page_seo").update(existing.id, data) : await pb.collection("page_seo").create(data)
      if (!["title_ar", "title_en", "path"].every(key => Object.hasOwn(record, key))) throw new Error(ar ? "يلزم تحديث قاعدة البيانات لحفظ العناوين." : "Update the database to save titles.")
      setRecords(previous => [...previous.filter(row => row.path !== path), record])
      setNotice(ar ? "تم حفظ عنواني الصفحة." : "Page titles saved.")
    } catch (e) { setError(getErrorMessage(e)) }
    finally { setSaving(false) }
  }
  return <div className="mx-auto max-w-4xl space-y-6">
    <h1 className="text-2xl font-bold">{ar ? "عناوين الصفحات" : "Page titles"}</h1>
    <p>{ar ? "اكتب عنوانًا موجزًا وفريدًا لكل لغة بصيغة: [الخدمة أو عنوان المقال] | DSC. اترك الحقل فارغًا لاستخدام العنوان التلقائي. تجنب تكرار الكلمات؛ لا تُضاف أي مدينة أو طريقة تقديم للخدمة تلقائيًا." : "Use a concise, unique title in each language: [Service or article title] | DSC. Leave a field empty for its automatic title. Avoid repeating keywords; no location or delivery method is added automatically."}</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {loading ? <p role="status">{ar ? "جارٍ التحميل…" : "Loading…"}</p> : <>
      <form onSubmit={save} className="space-y-5">
        <label className="block">{ar ? "الصفحة" : "Page"}<select className="mt-2 w-full rounded border p-3" value={path} onChange={event => { const next = event.target.value; const row = records.find(record => record.path === next); setPath(next); setTitleAr(row?.title_ar || ""); setTitleEn(row?.title_en || ""); setNotice("") }}>
          {pages.map(page => <option key={page.path} value={page.path}>{page.path} — {ar ? page.ar : page.en}</option>)}
        </select></label>
        <label className="block">{ar ? "عنوان الصفحة بالعربية" : "Arabic page title"}<Input dir="rtl" value={titleAr} maxLength={140} onChange={event => setTitleAr(event.target.value)} placeholder={selected?.ar} /></label>
        <p dir="rtl">{previewAr}</p>
        <label className="block">{ar ? "عنوان الصفحة بالإنجليزية" : "English page title"}<Input dir="ltr" value={titleEn} maxLength={140} onChange={event => setTitleEn(event.target.value)} placeholder={selected?.en} /></label>
        <p dir="ltr">{previewEn}</p>
        {duplicates && <p role="alert">{ar ? "يوجد عنوان مطابق في صفحة أخرى." : "A title matches another page."}</p>}
        <Button disabled={saving || !schemaReady || duplicates || !permissions.can(existing ? "cms.update" : "cms.create")}>{ar ? "حفظ العناوين" : "Save titles"}</Button>
      </form>
      <details><summary className="cursor-pointer font-semibold">{ar ? "خريطة عناوين الصفحات والكلمات المستهدفة" : "Page title and keyword map"}</summary>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-start text-sm"><thead><tr><th>{ar ? "الصفحة" : "Page"}</th><th>العربية</th><th>English</th></tr></thead><tbody>{pages.map(page => {
          const row = records.find(record => record.path === page.path)
          return <tr key={page.path} className="border-t"><td className="p-2" dir="ltr">{page.path}</td><td className="p-2" dir="rtl">{formatPageTitle(row?.title_ar || page.ar)}</td><td className="p-2" dir="ltr">{formatPageTitle(row?.title_en || page.en)}</td></tr>
        })}</tbody></table></div>
      </details>
    </>}
  </div>
}
