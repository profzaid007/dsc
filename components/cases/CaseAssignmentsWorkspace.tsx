"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, FolderOpen, Layers, Mail, Maximize2, Minimize2, Phone, Plus, Search, UserRound, UsersRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/format-date"

export type WorkspaceAssignment = { id: string; name: string; status: string; date: string; category?: string; content: ReactNode; actions?: ReactNode }
type Props = {
  ar: boolean; caseName: string; caseId: string; ownerName?: string; ownerLabel?: string; phone?: string
  items: WorkspaceAssignment[]; messages: ReactNode; documents: ReactNode; results: ReactNode; create: ReactNode; feedback?: ReactNode
}
const pageSize = 6

export function CaseAssignmentsWorkspace({ ar, caseName, caseId, ownerName, ownerLabel, phone, items, messages, documents, results, create, feedback }: Props) {
  const [tab, setTab] = useState<"assignments" | "messages" | "documents" | "results">("assignments")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const detailRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const listRef = useRef<HTMLElement>(null)
  const expandRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!selectedId || !window.matchMedia("(max-width: 1279px)").matches) return
    const frame = requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true })
      headingRef.current?.scrollIntoView({ block: "start", behavior: "instant" })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedId])
  useEffect(() => {
    if (!expanded) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    expandRef.current?.focus()
    const focusable = () => Array.from(detailRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]') || []).filter(element => element.getClientRects().length > 0)
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); setExpanded(false); return }
      if (event.key !== "Tab") return
      const controls = focusable(), first = controls[0], last = controls[controls.length - 1]
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    function focusin(event: FocusEvent) {
      if (!detailRef.current?.contains(event.target as Node)) expandRef.current?.focus()
    }
    document.addEventListener("keydown", keydown)
    document.addEventListener("focusin", focusin)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", keydown)
      document.removeEventListener("focusin", focusin)
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [expanded])
  const t = (a: string, e: string) => ar ? a : e
  const statusLabel = (status: string) => ({ assigned: t("تم التكليف", "Assigned"), pending: t("قيد الانتظار", "Pending"), in_progress: t("قيد العمل", "In progress"), incomplete: t("غير مكتمل", "Incomplete"), completed: t("مكتمل", "Completed") }[status] || status)
  const statusClass = (status: string) => status === "completed" ? "bg-green-100 text-green-800" : status === "in_progress" ? "bg-lime-100 text-lime-900" : "bg-amber-100 text-amber-900"
  const filtered = items.filter(item => `${item.name} ${statusLabel(item.status)} ${item.category || ""}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const selected = items.find(item => item.id === selectedId)
  const Back = ar ? ArrowRight : ArrowLeft
  return <div dir={ar ? "rtl" : "ltr"} className="space-y-6 text-[#082c4a]">
    <nav aria-label={t("مسار الصفحة", "Breadcrumb")} className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#346184]"><Link href="/dashboard/expert/cases" className="inline-flex items-center gap-2 hover:underline"><Back className="size-4" />{t("الحالات المخصصة لي", "My assigned cases")}</Link><span aria-hidden="true">/</span><h1 className="font-bold text-[#082c4a]">{t("التكليفات", "Assignments")}</h1></nav>
    <section aria-label={t("معلومات الحالة", "Case information")} className="grid gap-4 rounded-2xl border border-blue-200 bg-[#edf5ff] p-5 shadow-[0_3px_7px_#1648800c] md:grid-cols-[1fr_1fr_auto] md:items-center">
      <div className="flex items-center gap-3"><UserRound className="size-9 shrink-0 text-blue-700" /><div><p className="text-xs text-[#51708c]">{t("اسم الحالة", "Case name")}</p><p className="mt-1 text-lg font-bold" dir="auto">{caseName}</p></div></div>
      <div className="flex items-center gap-3 md:border-s md:border-blue-200 md:ps-5"><UsersRound className="size-9 shrink-0 text-blue-700" /><div><p className="text-xs text-[#51708c]">{ownerLabel || t("ولي الأمر / الجهة", "Parent / organization")}</p><p className="mt-1 font-bold" dir="auto">{ownerName || t("غير متوفر", "Not available")}</p>{phone && <a href={`tel:${phone}`} className="mt-1 inline-flex items-center gap-2 text-sm font-medium"><Phone className="size-3.5 text-blue-700" /><bdi>{phone}</bdi></a>}</div></div>
      <div className="rounded-xl border border-blue-200 bg-white/60 px-3 py-2 text-sm"><span className="text-[#51708c]">{t("رقم الحالة", "Case ID")}</span><bdi className="ms-2 font-mono text-xs font-semibold">{caseId}</bdi></div>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div role="tablist" aria-label={t("أقسام الحالة", "Case sections")} className="flex flex-wrap gap-2">
        {([{ id: "assignments", label: `${t("التكليفات", "Assignments")} (${items.length})`, icon: Layers }, { id: "messages", label: t("الرسائل", "Messages"), icon: Mail }, { id: "documents", label: t("ملفات الحالة", "Case files"), icon: FolderOpen }, { id: "results", label: t("النتائج والتقارير", "Results & reports"), icon: ClipboardList }] as const).map(({ id, label, icon: Icon }) => <button key={id} id={`case-tab-${id}`} aria-controls={`case-panel-${id}`} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${tab === id ? "border-blue-700 bg-[#005bb9] text-white shadow-sm" : "border-blue-200 bg-white text-[#134e85] hover:bg-blue-50"}`}><Icon className="size-5" />{label}</button>)}
      </div>
      <Button onClick={() => { setCreating(value => !value); setTab("assignments") }} aria-expanded={creating} aria-controls="case-new-assignment" className="min-h-12 rounded-xl bg-[#073d6b] px-5 text-base font-bold hover:bg-[#062f52]">{creating ? <X className="size-5" /> : <Plus className="size-5" />}{creating ? t("إغلاق", "Close") : t("تكليف جديد", "New assignment")}</Button>
    </div>
    {creating && <section id="case-new-assignment" aria-label={t("تكليف جديد", "New assignment")} className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">{create}</section>}
    {tab === "assignments" && <section id="case-panel-assignments" role="tabpanel" aria-labelledby="case-tab-assignments" className="space-y-4">
      <div className="relative max-w-md"><Search className="pointer-events-none absolute start-3 top-3 size-5 text-blue-700" /><Input aria-label={t("بحث في التكليفات", "Search assignments")} placeholder={t("بحث في التكليفات…", "Search assignments…")} value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} className="h-12 rounded-xl border-blue-200 bg-white ps-11 text-sm shadow-sm" /></div>
      <div dir="ltr" className="grid items-start gap-4 xl:grid-cols-[minmax(300px,.8fr)_minmax(0,1.3fr)]">
        <aside ref={listRef} tabIndex={-1} dir={ar ? "rtl" : "ltr"} aria-label={t("قائمة التكليفات", "Assignment list")} className="flex flex-col rounded-2xl xl:min-h-[530px] border border-blue-200 bg-white p-3 shadow-[0_3px_7px_#1648800c]">
          <div className="mb-2 flex items-center justify-between rounded-xl bg-[#e7f1ff] px-4 py-3 text-sm font-bold"><span>{t("التكليف", "Assignment")}</span><span>{t("التاريخ", "Date")}</span></div>
          <div className="space-y-2">{filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(item => <button key={item.id} aria-pressed={selectedId === item.id} onClick={() => { setSelectedId(item.id); setExpanded(false) }} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-4 text-start transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${selectedId === item.id ? "border-blue-500 bg-[#e7f1ff] shadow-[inset_0_0_0_1px_#3b82f6]" : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/60"}`}><span className="min-w-0 flex-1"><span className="block text-sm font-bold [overflow-wrap:anywhere]" dir="auto">{item.name}</span><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}>{statusLabel(item.status)}</span></span><span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#45647d]"><CalendarDays className="size-4 text-blue-700" /><bdi>{formatDate(item.date) || "—"}</bdi></span></button>)}{!filtered.length && <p className="px-4 py-12 text-center text-sm text-slate-600">{query ? t("لا توجد تكليفات مطابقة للبحث.", "No assignments match your search.") : t("لا توجد تكليفات متاحة بعد.", "No assignments available yet.")}</p>}</div>
          <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 px-1 pb-1 pt-6"><p className="text-xs font-semibold">{t("الإجمالي", "Total")}: {filtered.length} {t("تكليفًا", "assignments")}</p><div className="flex items-center gap-1.5" dir="ltr"><Button variant="outline" size="icon-sm" aria-label={t("الصفحة السابقة", "Previous page")} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft /></Button><span className="rounded-lg bg-[#073d6b] px-3 py-1 text-sm font-bold text-white">{currentPage} / {totalPages}</span><Button variant="outline" size="icon-sm" aria-label={t("الصفحة التالية", "Next page")} disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight /></Button></div></footer>
        </aside>
        {expanded && <div aria-hidden="true" className="fixed inset-0 z-40 bg-[#05233f]/45" />}
        <article ref={detailRef} role={expanded ? "dialog" : undefined} aria-modal={expanded || undefined} dir={ar ? "rtl" : "ltr"} aria-label={t("تفاصيل التكليف", "Assignment details")} className={`overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-[0_3px_7px_#1648800c] ${expanded ? "fixed inset-4 z-50 flex flex-col shadow-2xl" : "min-h-[530px]"}`}>
          <header className="flex min-h-20 items-center justify-between gap-3 bg-[#073d6b] px-5 py-4 text-white"><div className="flex min-w-0 items-center gap-3"><ClipboardList className="size-7 shrink-0 text-blue-100" /><h2 ref={headingRef} tabIndex={-1} className="scroll-mt-28 text-lg font-bold outline-none [overflow-wrap:anywhere]">{selected?.name || t("تفاصيل التكليف", "Assignment details")}</h2></div><div className="flex shrink-0 items-center gap-2">{selected && <span className={`hidden rounded-full px-3 py-1 text-xs font-bold sm:inline-block ${statusClass(selected.status)}`}>{statusLabel(selected.status)}</span>}<button ref={expandRef} onClick={() => setExpanded(value => !value)} aria-label={expanded ? t("تصغير اللوحة", "Exit expanded view") : t("توسيع اللوحة", "Expand panel")} className="rounded-lg p-2 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">{expanded ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}</button></div></header>
          {selected ? <div className={`space-y-5 p-5 ${expanded ? "overflow-y-auto" : ""}`}><Button variant="outline" className="xl:hidden" onClick={() => { setSelectedId(null); setExpanded(false); listRef.current?.focus({preventScroll:true}); listRef.current?.scrollIntoView({block:"start",behavior:"instant"}) }}><Back className="size-4" />{t("العودة إلى قائمة التكليفات", "Back to assignment list")}</Button><p className="text-xs text-slate-600">{t("تاريخ التكليف", "Assigned on")}: <bdi>{formatDate(selected.date) || "—"}</bdi>{selected.category && ` · ${selected.category}`}</p>{selected.content}{selected.actions && <footer className="flex flex-wrap items-center gap-3 border-t border-blue-100 pt-5">{selected.actions}</footer>}</div> : <div className="flex min-h-[445px] flex-col items-center justify-center gap-4 p-8 text-center"><div className="rounded-2xl bg-blue-50 p-5"><ClipboardList className="size-10 text-blue-600" /></div><h3 className="text-lg font-bold">{t("اختر تكليفًا للعرض", "Select an assignment")}</h3><p className="max-w-xs text-sm leading-7 text-slate-600">{t("اضغط على اسم التكليف في القائمة لعرض الأداة والإجابات والتفاصيل هنا.", "Choose an assignment from the list to view its tool, responses and details here.")}</p></div>}
        </article>
      </div>
    </section>}
    {tab === "messages" && <section id="case-panel-messages" role="tabpanel" aria-labelledby="case-tab-messages">{messages}</section>}
    {tab === "documents" && <section id="case-panel-documents" role="tabpanel" aria-labelledby="case-tab-documents">{documents}</section>}
    {tab === "results" && <section id="case-panel-results" role="tabpanel" aria-labelledby="case-tab-results" className="space-y-5">{results}{feedback}</section>}
  </div>
}
