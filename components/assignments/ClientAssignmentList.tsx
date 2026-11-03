"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ClipboardList, Filter, Search } from "lucide-react"
import { useLang } from "@/lib/lang-context"
import { useAuth } from "@/hooks/useAuth"
import { useProfiles } from "@/hooks/useProfiles"
import { useClientAssignments } from "@/hooks/useClientAssignments"
import { clientAssignmentHref, clientAssignmentLabel, clientAssignmentStatus, clientCaseAccessible, clientRoutes, isClientRole, ownedClientProfiles, type ClientAssignmentSummary, type ClientRole } from "@/lib/client-services"
import { Input } from "@/components/ui/input"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"
import type { Profile } from "@/types/profile"

type Props = { ar: boolean; role: ClientRole; userId: string; profiles: Profile[]; assignments: ClientAssignmentSummary[] }
export function ClientAssignmentListView({ ar, role, userId, profiles: allProfiles, assignments: allAssignments }: Props) {
 const t=(a:string,e:string)=>ar?a:e
 const profiles=ownedClientProfiles(allProfiles,userId)
 const byId=new Map(profiles.map(profile=>[profile.id,profile]))
 const assignments=allAssignments.filter(item=>byId.has(item.case))
 const [caseId,setCaseId]=useState("")
 const [kind,setKind]=useState("")
 const [status,setStatus]=useState("")
 const [query,setQuery]=useState("")
 const routes=clientRoutes(role),project=role==="organization"
 const Arrow=ar?ArrowLeft:ArrowRight
 const items=assignments.filter(item=>(!caseId||item.case===caseId)&&(!kind||item.kind===kind)&&(!status||item.status===status)&&`${clientAssignmentLabel(item,ar)} ${byId.get(item.case)?.name||""}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).sort((a,b)=>b.created.localeCompare(a.created)||a.id.localeCompare(b.id))
 const statuses=[...new Set(assignments.map(item=>item.status))]
 const selectClass="h-12 w-full min-w-0 rounded-xl border border-blue-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
 return <section dir={ar?"rtl":"ltr"} className="min-w-0 space-y-5 text-[#082c4a]">
  <header className="space-y-2"><h1 className="flex items-center gap-3 text-2xl font-bold"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><ClipboardList className="size-6" /></span>{t("تكليفاتي","My assignments")}</h1><p className="text-sm leading-7 text-[#51708c]">{project?t("المقاييس والمهام التي شاركها المختصون معك. اختر المشروع ثم افتح التكليف للمشاركة أو مراجعة إجاباتك.","Assessments and tasks shared by your specialists. Choose a project, then open an assignment to respond or review your answers."):t("المقاييس والمهام التي شاركها المختصون معك. اختر الحالة ثم افتح التكليف للمشاركة أو مراجعة إجاباتك.","Assessments and tasks shared by your specialists. Choose a case, then open an assignment to respond or review your answers.")}</p></header>
  <div className="grid min-w-0 gap-4 rounded-2xl border border-blue-200 bg-[#edf5ff] p-4 sm:grid-cols-2 xl:grid-cols-4">
   <label className="min-w-0 space-y-2 text-xs font-semibold text-[#346184]"><span>{project?t("المشروع","Project"):t("الحالة","Case")}</span><select value={caseId} onChange={event=>setCaseId(event.target.value)} className={selectClass}><option value="">{project?t("كل المشاريع","All projects"):t("كل الحالات","All cases")}</option>{profiles.map(profile=><option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>
   <label className="min-w-0 space-y-2 text-xs font-semibold text-[#346184]"><span>{t("الحصر حسب نوع التكليف","Filter by assignment type")}</span><select value={kind} onChange={event=>setKind(event.target.value)} className={selectClass}><option value="">{t("كل الأنواع","All types")}</option><option value="assessment">{t("مقياس / تقييم","Assessment")}</option><option value="task">{t("تكليف / أداة","Task / tool")}</option></select></label>
   <label className="min-w-0 space-y-2 text-xs font-semibold text-[#346184]"><span>{t("الحالة التنفيذية","Progress status")}</span><select value={status} onChange={event=>setStatus(event.target.value)} className={selectClass}><option value="">{t("كل الحالات التنفيذية","All statuses")}</option>{statuses.map(value=><option key={value} value={value}>{clientAssignmentStatus(value,ar)}</option>)}</select></label>
   <label className="min-w-0 space-y-2 text-xs font-semibold text-[#346184]"><span>{t("البحث","Search")}</span><div className="relative"><Search className="pointer-events-none absolute start-3 top-3.5 size-5 text-blue-700" /><Input value={query} onChange={event=>setQuery(event.target.value)} placeholder={t("اسم التكليف أو الحالة…","Assignment or case name…")} className="h-12 rounded-xl border-blue-200 bg-white ps-10" /></div></label>
  </div>
  <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b border-blue-100 px-5 py-4"><h2 className="text-sm font-bold">{t("قائمة التكليفات","Assignment list")}</h2><p aria-live="polite" className="text-xs font-semibold text-[#51708c]">{items.length} / {assignments.length}</p></div>{items.length?<ul className="divide-y divide-blue-100 px-4 sm:px-5">{items.map(item=>{const profile=byId.get(item.case)!;const active=clientCaseAccessible(profile);return <li key={`${item.kind}:${item.id}`} className="flex min-w-0 flex-wrap items-center justify-between gap-4 py-5"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-800">{item.kind==="assessment"?t("مقياس / تقييم","Assessment"):t("تكليف / أداة","Task / tool")}</span><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${item.status==="completed"?"bg-green-100 text-green-800":"bg-amber-100 text-amber-900"}`}>{clientAssignmentStatus(item.status,ar)}</span></div><h3 className="text-sm font-bold leading-7 [overflow-wrap:anywhere]">{clientAssignmentLabel(item,ar)}</h3><p className="mt-1 text-xs leading-6 text-[#51708c]"><bdi>{profile.name}</bdi>{!active&&<span className="ms-2 text-amber-800">· {project?t("يتطلب تفعيل المشروع","Project activation required"):t("يتطلب تفعيل الحالة","Case activation required")}</span>}</p></div><Link href={active?clientAssignmentHref(item,role):`${routes.cases}/${encodeURIComponent(profile.id)}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-blue-200 px-4 text-xs font-bold text-blue-800 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600">{active?t("فتح التكليف","Open assignment"):t("متابعة التفعيل","Review activation")}<Arrow className="size-4" /></Link></li>})}</ul>:<div className="flex min-h-60 flex-col items-center justify-center gap-3 px-6 py-10 text-center"><Filter className="size-8 text-blue-600" /><p className="font-bold">{t("لا توجد تكليفات مطابقة","No matching assignments")}</p><p className="max-w-md text-sm leading-7 text-[#51708c]">{assignments.length?t("غيّر خيارات التصفية أو عبارة البحث لعرض تكليفات أخرى.","Change the filters or search text to view other assignments."):t("ستظهر التكليفات هنا عندما يشاركها المختصون معك.","Assignments will appear here when your specialists share them with you.")}</p></div>}</div>
 </section>
}
function AssignmentData({userId,role}:{userId:string;role:ClientRole}){
 const {lang}=useLang()
 const cases=useProfiles()
 const summary=useClientAssignments()
 if(cases.isLoading||summary.isLoading)return <PageLoader />
 if(cases.loadError||summary.error)return <DataError message={cases.loadError||summary.error} onRetry={()=>{void cases.refresh();summary.refresh()}} />
 return <ClientAssignmentListView ar={lang==="ar"} role={role} userId={userId} profiles={cases.profiles} assignments={summary.data?.assignments||[]} />
}
export function ClientAssignmentList(){
 const {currentUser,isLoading}=useAuth();const {lang}=useLang()
 if(isLoading)return <PageLoader />
 if(!currentUser||!isClientRole(currentUser.role))return <p role="alert">{lang==="ar"?"التكليفات الشخصية متاحة للعملاء فقط.":"Personal assignments are available to clients only."}</p>
 return <AssignmentData key={`${currentUser.id}:${currentUser.role}`} userId={currentUser.id} role={currentUser.role} />
}
