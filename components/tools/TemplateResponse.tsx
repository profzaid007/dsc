"use client"
import { useRef,useState } from "react"
import type { CaseTool } from "@/types/assignment"
import type { PlanConfig,ReportConfig } from "@/types/tool"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/pb"

export function TemplateResponse({task,kind,readOnly=false,save}:{task:CaseTool;kind:string;readOnly?:boolean;save?:(id:string,data:Partial<CaseTool>)=>Promise<void>}){
 const {lang}=useLang(),ar=lang==="ar",t=(a:string,b:string)=>ar?a:b
 const [answers,setAnswers]=useState<Record<string,unknown>>(()=>structuredClone(task.responses||{})),[error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false)
 const pending=useRef(false),locked=readOnly||task.status==="completed"
 const config=task.config as PlanConfig & ReportConfig
 function change(key:string,value:unknown){setAnswers(a=>({...a,[key]:value}))}
 async function submit(finalize:boolean){if(!save||pending.current)return;pending.current=true;setBusy(true);setError("");try{await save(task.id,{responses:answers,status:finalize?"completed":"in_progress"});setNotice(t("تم حفظ الإجابات.","Responses saved."))}catch(e){setError(getErrorMessage(e,lang))}finally{pending.current=false;setBusy(false)}}
 return <section className="space-y-5 rounded-xl border bg-white p-5" dir={ar?"rtl":"ltr"}>
  <h2 className="text-xl font-bold">{task.name_ar||task.name_en}</h2>
  <fieldset disabled={locked||busy} className="space-y-4">
   {kind==="plan"?<>
    <div>{config.goals?.map(g=><div key={g.id} className="mb-3"><h3 className="font-semibold">{g.title}</h3><p className="whitespace-pre-wrap">{g.description}</p></div>)}</div>
    {config.steps?.map(step=><div key={step.id} className="space-y-2 rounded border p-3"><label className="flex gap-2"><input type="checkbox" checked={answers[`step-${step.id}`]===true} onChange={e=>change(`step-${step.id}`,e.target.checked)} />{step.title}</label><p className="whitespace-pre-wrap">{step.description}</p><Label htmlFor={`step-note-${step.id}`}>{t("ملاحظات التنفيذ","Progress notes")}</Label><Textarea id={`step-note-${step.id}`} dir="auto" value={String(answers[`note-${step.id}`]||"")} onChange={e=>change(`note-${step.id}`,e.target.value)} /></div>)}
   </>:<>
    <p className="whitespace-pre-wrap">{config.assessment}</p><p className="whitespace-pre-wrap">{config.suggestions}</p>
    {config.customFields?.map(field=><div key={field.id} className="space-y-2"><Label htmlFor={`report-${field.id}`}>{field.label}</Label>{field.type==="textarea"?<Textarea id={`report-${field.id}`} dir="auto" value={String(answers[field.id]||"")} onChange={e=>change(field.id,e.target.value)} />:<Input id={`report-${field.id}`} dir="auto" type={field.type==="date"?"date":"text"} value={String(answers[field.id]||"")} onChange={e=>change(field.id,e.target.value)} />}</div>)}
   </>}
   <Label htmlFor={`template-response-${task.id}`}>{t("إجابة / ملاحظات","Response / notes")}</Label><Textarea id={`template-response-${task.id}`} dir="auto" maxLength={4000} value={String(answers.general||"")} onChange={e=>change("general",e.target.value)} />
  </fieldset>
  {!locked&&save&&<div className="flex flex-wrap gap-3"><Button type="button" disabled={busy} variant="outline" onClick={()=>void submit(false)}>{t("حفظ مسودة الإجابة","Save response draft")}</Button><Button type="button" disabled={busy} onClick={()=>void submit(true)}>{t("إرسال الإجابات","Submit responses")}</Button></div>}
  {error&&<p role="alert" className="text-destructive">{error}</p>}{notice&&<p role="status">{notice}</p>}
 </section>
}
