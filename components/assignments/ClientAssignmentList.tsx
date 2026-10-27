"use client"
import { CaseName } from "@/components/cases/CaseName"
import type { Profile } from "@/types/profile"
import { useEffect, useState } from "react"
import Link from "next/link"
import pb, {getErrorMessage} from "@/lib/pb"
import {useLang} from "@/lib/lang-context"
import {useAuth} from "@/hooks/useAuth"
import {Button} from "@/components/ui/button"
interface Assignment {id:string;kind:"task"|"assessment";case:string;caseName:string;owner_display?:Profile["owner_display"];name_en:string;name_ar:string;status:string;created:string}
interface Data {cases:{id:string;name:string;owner_display?:Profile["owner_display"]}[];assignments:Assignment[]}
export function ClientAssignmentList() {
 const {lang}=useLang();const ar=lang==="ar";const {currentUser}=useAuth()
 const parent=currentUser?.role==="parent" || currentUser?.role==="care_foundation"
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState(""),[child,setChild]=useState(""),[reload,setReload]=useState(0)
 useEffect(()=>{
  if(!currentUser?.id)return
  let active=true;const controller=new AbortController()
  queueMicrotask(()=>{if(active){setData(null);setError("")}})
  pb.send<Data>("/api/dsc/my-assignments",{method:"GET",signal:controller.signal,requestKey:null}).then(result=>{if(active)setData(result)}).catch(err=>{if(active)setError((ar?"تعذر تحميل التكليفات: ":"Unable to load assignments: ")+getErrorMessage(err,lang))})
  return()=>{active=false;controller.abort()}
 },[currentUser?.id,lang,ar,reload])
 const items=data?.assignments.filter(item=>!child||item.case===child)||[]
 const prefix=parent?"/dashboard/parent/cases":currentUser?.role==="organization"?"/dashboard/institution/projects":"/dashboard/cases"
 const statuses:Record<string,string>={pending:ar?"قيد الانتظار":"Pending",assigned:ar?"بانتظار إجابتك":"Assigned",in_progress:ar?"قيد التنفيذ":"In progress",incomplete:ar?"غير مكتمل":"Incomplete",completed:ar?"مكتمل":"Completed"}
 return <section className="space-y-4 rounded-lg border bg-white p-5">
  <header className="flex items-center justify-between gap-3"><h1 className="text-xl font-bold text-primary">{ar?"تكليفاتي":"My Assignments"}</h1><Button variant="outline" onClick={()=>setReload(value=>value+1)}>{ar?"تحديث":"Refresh"}</Button></header>
  <p className="text-sm text-muted-foreground">{parent?(ar?"التكليفات المرسلة لأطفالك، بما فيها المقاييس والتكليفات الأخرى. اختر طفلًا لعرض تكليفاته.":"View assessments and other assignments for your children. Select a child to view their assignments."):(ar?"المقاييس والتكليفات المسندة إلى حالاتك.":"Assessments and other assignments for your cases.")}</p>
  {error?<p role="alert" className="text-red-700">{error}</p>:!data?<p role="status">{ar?"جارٍ تحميل التكليفات…":"Loading assignments…"}</p>:<>
   <label className="block space-y-2"><span>{parent?(ar?"الطفل":"Child"):(ar?"الحالة":"Case")}</span><select className="block w-full rounded-md border p-2" value={child} onChange={event=>setChild(event.target.value)}><option value="">{parent?(ar?"جميع الأطفال":"All children"):(ar?"جميع الحالات":"All cases")}</option>{data.cases.map(c=><option key={c.id} value={c.id}>{c.name}{c.owner_display ? ` (${c.owner_display.name})` : ""}</option>)}</select></label>
   {!items.length?<p className="rounded bg-slate-50 p-4">{ar?"لا توجد تكليفات مرئية لهذا الاختيار حاليًا.":"No visible assignments for this selection yet."}</p>:<ul className="divide-y">{items.map(item=><li key={item.kind+item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><h2 className="font-bold">{(ar?item.name_ar:item.name_en)||item.name_en||item.name_ar||(ar?"تكليف بلا عنوان":"Untitled assignment")}</h2><p className="text-sm text-muted-foreground"><CaseName profile={{name:item.caseName,owner_display:item.owner_display}} /> · {item.kind==="assessment"?(ar?"مقياس":"Assessment"):(ar?"تكليف":"Assignment")} · {statuses[item.status]||item.status}</p></div><Link className="rounded border px-3 py-2 text-primary" href={item.kind==="assessment"?`/dashboard/assessments/${encodeURIComponent(item.id)}`:`${prefix}/${encodeURIComponent(item.case)}/tasks/${encodeURIComponent(item.id)}`}>{ar?"فتح التكليف":"Open assignment"}</Link></li>)}</ul>}
  </>}
 </section>
}
