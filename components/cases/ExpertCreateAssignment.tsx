"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Tool = {id:string;name_en:string;name_ar:string;description:string;type_en:string;type_ar:string}
export function ExpertCreateAssignment({ caseId, onCreated }: { caseId: string; onCreated: () => void }) {
  const {lang}=useLang();const ar=lang==="ar"
  const [open,setOpen]=useState(false),[tools,setTools]=useState<Tool[]>([]),[selected,setSelected]=useState(""),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState(""),[reload,setReload]=useState(0)
  const submitting=useRef(false)
  useEffect(()=>{
    if(!open)return
    let active=true;const controller=new AbortController()
    queueMicrotask(()=>{if(active){setLoading(true);setError("");setTools([]);setSelected("")}})
    pb.send<{tools:Tool[]}>(`/api/dsc/expert/cases/${encodeURIComponent(caseId)}/assignment-tools`,{method:"GET",query:{language:lang},signal:controller.signal,requestKey:null}).then(data=>{if(active)setTools(data.tools)}).catch(e=>{if(active)setError(getErrorMessage(e,lang))}).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false;controller.abort()}
  },[open,caseId,lang,reload])
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(submitting.current)return
    if(!selected){setError(ar?"اختر أداة لتكليف الحالة بها.":"Select a tool to assign.");return}
    submitting.current=true;setBusy(true);setError("");setNotice("")
    try{
      await pb.send(`/api/dsc/expert/cases/${encodeURIComponent(caseId)}/assignments`,{method:"POST",body:{tool_id:selected,language:lang},requestKey:null})
      setSelected("");setOpen(false);setNotice(ar?"تم تكليف الحالة بالأداة. تظهر لدى صاحب الحالة ضمن «تكليفاتي».":"Tool assigned. It appears in the case owner's My Assignments.");onCreated()
    }catch(e){setError(getErrorMessage(e,lang))}finally{submitting.current=false;setBusy(false)}
  }
  const tool=tools.find(t=>t.id===selected)
  return <div className="space-y-3">
    <Button type="button" aria-expanded={open} aria-controls="create-case-assignment" disabled={busy} onClick={()=>{setOpen(!open);setNotice("");setError("")}}>{ar?"إضافة تكليف":"Add assignment"}</Button>
    {notice&&<p role="status" className="rounded-md bg-green-50 p-3 text-green-900">{notice}</p>}
    {open&&<form id="create-case-assignment" onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-4">
      <h3 className="text-lg font-semibold">{ar?"تكليف الحالة بأداة":"Assign a tool to this case"}</h3>
      <p className="text-sm text-muted-foreground">{ar?"اختر أي أداة مفعلة لتكليف الحالة بها. سيفتح صاحب الحالة الأداة ويكملها من «تكليفاتي».":"Choose any active tool to assign to this case. The case owner can open and complete it from My Assignments."}</p>
      {loading?<p role="status">{ar?"جارٍ تحميل الأدوات…":"Loading tools…"}</p>:<>
        {error&&<p role="alert" className="rounded-md bg-red-50 p-3 text-red-800">{error}</p>}
        {!error&&!tools.length&&<p role="status">{ar?"لا توجد أدوات مفعلة حاليًا. يلزم إضافة أداة وتفعيلها أولًا.":"No active tools are available. Add and activate a tool first."}</p>}
        {!!tools.length&&<div className="space-y-2"><Label htmlFor="assignment-tool">{ar?"الأداة":"Tool"}</Label><select id="assignment-tool" required disabled={busy} value={selected} onChange={e=>setSelected(e.target.value)} className="h-11 w-full rounded-md border bg-background px-3"><option value="">{ar?"اختر الأداة":"Select a tool"}</option>{tools.map(t=><option key={t.id} value={t.id}>{(ar?t.name_ar:t.name_en)||t.name_en||t.name_ar} — {(ar?t.type_ar:t.type_en)||t.type_en||t.type_ar}</option>)}</select>{tool?.description&&<p dir="auto" className="whitespace-pre-wrap text-sm text-muted-foreground">{tool.description}</p>}</div>}
      </>}
      <div className="flex flex-wrap gap-2"><Button type="submit" disabled={loading||busy||!selected}>{busy?(ar?"جارٍ الإسناد…":"Assigning…"):(ar?"تكليف الحالة بالأداة":"Assign tool")}</Button><Button type="button" variant="outline" disabled={busy||loading} onClick={()=>setReload(v=>v+1)}>{ar?"تحديث الأدوات":"Refresh tools"}</Button><Button type="button" variant="outline" disabled={busy} onClick={()=>setOpen(false)}>{ar?"إلغاء":"Cancel"}</Button></div>
    </form>}
  </div>
}
