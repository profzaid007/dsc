"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { FileText, FolderOpen, UsersRound } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useProfiles } from "@/hooks/useProfiles"
import { useLang } from "@/lib/lang-context"
import { clientRoutes, isClientRole, ownedClientProfiles, type ClientRole } from "@/lib/client-services"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"
import { PaymentGate } from "@/components/cases/PaymentGate"
import { CaseDocuments } from "@/components/cases/CaseDocuments"
import { CaseAssessments } from "@/components/assessments/CaseAssessments"
import type { Profile } from "@/types/profile"

type ResourceTab = "reports" | "documents"
type ViewProps = { ar: boolean; role: ClientRole; userId: string; profiles: Profile[]; initialTab?: ResourceTab; renderResources: (profile: Profile, tab: ResourceTab) => ReactNode }
export function ClientResourcesView({ ar, role, userId, profiles: allProfiles, initialTab = "reports", renderResources }: ViewProps) {
  const t = (a: string, e: string) => ar ? a : e
  const profiles = ownedClientProfiles(allProfiles, userId)
  const [selectedId, setSelectedId] = useState("")
  const [tab, setTab] = useState<ResourceTab>(initialTab)
  const selected = profiles.find(profile => profile.id === selectedId) || profiles[0]
  const routes = clientRoutes(role), project = role === "organization"
  return <div dir={ar ? "rtl" : "ltr"} className="min-w-0 space-y-6 text-[#082c4a]">
    <header className="space-y-2"><h1 className="flex items-center gap-3 text-2xl font-bold"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><FolderOpen className="size-6" /></span>{t("النتائج والملفات المشتركة", "Shared results & files")}</h1><p className="max-w-3xl text-sm leading-7 text-[#51708c]">{project ? t("اختر المشروع للاطلاع على النتائج والملفات التي شاركها المختصون معك. يتاح المحتوى بعد تفعيل المشروع.", "Choose a project to view results and files shared by your specialists. Content is available after project activation.") : t("اختر الحالة للاطلاع على النتائج والملفات التي شاركها المختصون معك. يتاح المحتوى بعد تفعيل الحالة.", "Choose a case to view results and files shared by your specialists. Content is available after case activation.")}</p></header>
    {profiles.length ? <><section className="rounded-2xl border border-blue-200 bg-[#edf5ff] p-5"><label htmlFor="client-resource-case" className="mb-2 block text-xs font-semibold text-[#346184]">{project ? t("المشروع", "Project") : t("الحالة", "Case")}</label><div className="flex flex-wrap items-center justify-between gap-3"><select id="client-resource-case" value={selected?.id || ""} onChange={event => setSelectedId(event.target.value)} className="h-12 w-full min-w-0 rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:max-w-md">{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select>{selected && <Link href={`${routes.cases}/${encodeURIComponent(selected.id)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-xs font-bold text-blue-800 hover:bg-blue-50"><UsersRound className="size-4" />{project ? t("فتح المشروع", "Open project") : t("فتح الحالة", "Open case")}</Link>}</div></section><div role="tablist" aria-label={t("نوع المحتوى", "Content type")} className="flex flex-wrap gap-2">{([{ id: "reports", label: t("النتائج والتقارير", "Results & reports"), icon: FileText }, { id: "documents", label: t("الملفات المشتركة", "Shared files"), icon: FolderOpen }] as const).map(item => <button key={item.id} type="button" id={`client-resource-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls="client-resource-content" onClick={() => setTab(item.id)} className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-blue-600 ${tab === item.id ? "border-[#073d6b] bg-[#073d6b] text-white" : "border-blue-200 bg-white text-[#134e85] hover:bg-blue-50"}`}><item.icon className="size-5" />{item.label}</button>)}</div>{selected && <section key={`${selected.id}:${tab}`} id="client-resource-content" role="tabpanel" aria-labelledby={`client-resource-${tab}`} className="min-w-0 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm sm:p-5">{renderResources(selected, tab)}</section>}</> : <section className="space-y-4 rounded-2xl border border-blue-200 bg-white px-6 py-12 text-center"><FolderOpen className="mx-auto size-9 text-blue-600" /><h2 className="font-bold">{project ? t("أضف مشروعك أولًا", "Add a project first") : t("أضف حالتك أولًا", "Add a case first")}</h2><p className="text-sm text-[#51708c]">{t("ستظهر النتائج والملفات هنا بعد مشاركتها معك.", "Results and files will appear here after they are shared with you.")}</p><Link href={routes.newCase} className="inline-flex min-h-11 items-center rounded-xl bg-[#073d6b] px-5 text-sm font-bold text-white">{project ? t("إضافة مشروع", "Add project") : t("إضافة حالة", "Add case")}</Link></section>}
  </div>
}
function ResourceData({ userId, role, initialTab }: { userId: string; role: ClientRole; initialTab: ResourceTab }) {
  const { lang } = useLang()
  const { profiles, isLoading, loadError, refresh } = useProfiles()
  if (isLoading) return <PageLoader />
  if (loadError) return <DataError message={loadError} onRetry={refresh} />
  return <ClientResourcesView ar={lang === "ar"} role={role} userId={userId} profiles={profiles} initialTab={initialTab} renderResources={(profile, tab) => <PaymentGate profile={profile} noun={role === "organization" ? "project" : "case"}>{tab === "reports" ? <CaseAssessments key={profile.id} caseId={profile.id} /> : <CaseDocuments key={profile.id} caseId={profile.id} mode="list" />}</PaymentGate>} />
}
export function ClientResources({ initialTab = "reports" }: { initialTab?: ResourceTab }) {
  const { currentUser, isLoading } = useAuth()
  const { lang } = useLang()
  if (isLoading) return <PageLoader />
  if (!currentUser || !isClientRole(currentUser.role)) return <p role="alert">{lang === "ar" ? "هذه المساحة متاحة للعملاء فقط." : "This workspace is available to clients only."}</p>
  return <ResourceData key={`${currentUser.id}:${currentUser.role}`} userId={currentUser.id} role={currentUser.role} initialTab={initialTab} />
}
