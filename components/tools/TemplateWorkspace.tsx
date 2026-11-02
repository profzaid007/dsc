"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import pb, { getErrorMessage } from "@/lib/pb"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

type Kind="assessment"|"report"|"plan"|"survey"|"multiple_answer"
type Row={id:string;[key:string]:unknown}
type Config=Record<string,unknown>
type Draft={id:string;source:string;name:string;config:Config;population?:Record<string,unknown>}
type Template={id:string;name:string;kind:Kind;scope:"public"|"private";config?:Config}
const kinds: {key:Kind;ar:string;en:string}[]=[{key:"assessment",ar:"مقياس",en:"Assessment"},{key:"report",ar:"تقرير",en:"Report"},{key:"plan",ar:"خطة",en:"Plan"},{key:"survey",ar:"استبيان",en:"Survey"},{key:"multiple_answer",ar:"اختيار متعدد",en:"Multiple choice"}]
const id=()=>crypto.randomUUID().replaceAll("-","").slice(0,15)
function fresh(kind:Kind):Config{
 if(kind==="plan")return {goals:[],steps:[],startDate:"",endDate:"",media:[]}
 if(kind==="report")return {assessment:"",suggestions:"",customFields:[],media:[]}
 if(kind==="survey")return {title:{ar:"",en:""},answerType:"single_choice",options:[],questions:[],media:[]}
 return {title:{ar:"",en:""},questions:[],media:[]}
}
export function TemplateWorkspace({caseId,onSent,initialKind="plan",lockKind=false}:{caseId?:string;onSent?:()=>void;initialKind?:Kind;lockKind?:boolean}){
 const {lang}=useLang(),ar=lang==="ar",t=(a:string,b:string)=>ar?a:b
 const {currentUser}=useAuth(),privateMode=currentUser?.role==="expert"
 const [kind,setKind]=useState<Kind>(initialKind),[templates,setTemplates]=useState<Template[]>([]),[source,setSource]=useState(""),[name,setName]=useState(""),[config,setConfig]=useState<Config>(()=>fresh(initialKind))
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState(""),[population,setPopulation]=useState({age:"",sex:"",language:"",group:""})
 const [draftId,setDraftId]=useState(""),[drafts,setDrafts]=useState<Draft[]>([])
 const generation=useRef(0),submitting=useRef(false)
 useEffect(()=>{const c=new AbortController();Promise.all([
  pb.send<{templates:Template[]}>("/api/dsc/tool-templates",{method:"GET",signal:c.signal,requestKey:null}),
  caseId?pb.send<{drafts:Draft[]}>(`/api/dsc/cases/${encodeURIComponent(caseId)}/template-drafts`,{method:"GET",signal:c.signal,requestKey:null}):Promise.resolve({drafts:[]})
 ]).then(([catalogue,saved])=>{setTemplates(catalogue.templates);setDrafts(saved.drafts)}).catch(e=>{if(!c.signal.aborted)setError(getErrorMessage(e,lang))}).finally(()=>{if(!c.signal.aborted)setLoading(false)});return()=>c.abort()},[lang,caseId])

 function changeKind(next:Kind){setDraftId("");generation.current++;setKind(next);setSource("");setName("");setConfig(fresh(next));setError("");setNotice("")}
 async function select(value:string){
  const token=++generation.current;setDraftId("");setSource("");setNotice("");setError("");setBusy(true)
  try{const r=await pb.send<Template>(`/api/dsc/tool-templates/${encodeURIComponent(value)}`,{method:"GET",requestKey:null});if(token!==generation.current)return;setSource(r.id);setName(r.name);setConfig(structuredClone(r.config||{}))}catch(e){if(token===generation.current)setError(getErrorMessage(e,lang))}finally{if(token===generation.current)setBusy(false)}
 }
 function field(key:string,value:unknown){setDraftId("");setConfig(c=>({...c,[key]:value}))}
 function rows(key:string):Row[]{return Array.isArray(config[key])?config[key] as Row[]:[]}
 function rowChange(key:string,index:number,patch:Partial<Row>){field(key,rows(key).map((row,i)=>i===index?{...row,...patch}:row))}
 function text(key:string,label:string,multiline=false){return <div className="space-y-2"><Label htmlFor={`template-${key}`}>{label}</Label>{multiline?<Textarea id={`template-${key}`} dir="auto" value={String(config[key]||"")} onChange={e=>field(key,e.target.value)} />:<Input id={`template-${key}`} dir="auto" value={String(config[key]||"")} onChange={e=>field(key,e.target.value)} />}</div>}
 function listEditor(key:string,label:string,titleKey="title"){
  return <section className="space-y-3 rounded-lg border p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{label}</h3><Button type="button" variant="outline" onClick={()=>field(key,[...rows(key),{id:id(),[titleKey]:"",description:"",order:rows(key).length,...(key==="steps"?{completed:false}:{}),...(key==="customFields"?{type:"textarea"}:{}),...(key==="questions"?{required:true,answerType:"text",options:[]}:{} )}])}>{t("إضافة","Add")}</Button></div>
   {rows(key).map((row,index)=><div key={row.id} className="space-y-2 rounded border p-3"><Label htmlFor={`${key}-${row.id}`}>{label} {index+1}</Label><Textarea id={`${key}-${row.id}`} dir="auto" value={String(row[titleKey]||"")} onChange={e=>rowChange(key,index,{[titleKey]:e.target.value})} />
    {(key==="goals"||key==="steps")&&<Textarea aria-label={t("التفاصيل","Details")} dir="auto" value={String(row.description||"")} onChange={e=>rowChange(key,index,{description:e.target.value})} />}
    {key==="questions"&&kind==="multiple_answer"&&<><select aria-label={t("نوع الإجابة","Answer type")} className="h-10 w-full rounded border px-2" value={String(row.answerType||"text")} onChange={e=>rowChange(key,index,{answerType:e.target.value})}><option value="text">{t("نص","Text")}</option><option value="number">{t("رقم","Number")}</option><option value="single_choice">{t("اختيار واحد","Single choice")}</option><option value="multiple_choice">{t("اختيارات متعددة","Multiple choices")}</option></select>{["single_choice","multiple_choice"].includes(String(row.answerType))&&optionEditor(Array.isArray(row.options)?row.options as Row[]:[],options=>rowChange(key,index,{options}))}</>}
    {key!=="questions"||kind!=="assessment"?<Button type="button" variant="outline" onClick={()=>field(key,rows(key).filter((_,i)=>i!==index))}>{t("إزالة","Remove")}</Button>:null}
   </div>)}
  </section>
 }
 function optionEditor(options:Row[],update:(v:Row[])=>void){return <div className="space-y-2">{options.map((option,i)=><div key={option.id||String(option.value)} className="flex gap-2"><Input aria-label={t("بديل الإجابة","Answer option")} dir="auto" value={String((ar?option.labelAr:option.label)||option.label||option.labelAr||"")} onChange={e=>update(options.map((o,j)=>j===i?{...o,label:e.target.value,labelAr:e.target.value}:o))} /><Button type="button" variant="outline" onClick={()=>update(options.filter((_,j)=>j!==i))}>{t("إزالة","Remove")}</Button></div>)}<Button type="button" variant="outline" onClick={()=>update([...options,{id:id(),value:id(),label:"",labelAr:"",isCorrect:false,order:options.length}])}>{t("إضافة بديل","Add option")}</Button></div>}
 async function save(action:"private"|"draft"|"send"){
  if(submitting.current)return
  if(!name.trim()||(caseId&&!source)){setError(t("اختر قالبًا وأدخل الاسم.","Choose a template and enter its name."));return}
  submitting.current=true;setBusy(true);setError("");setNotice("")
  try{
   const payload={name:name.trim(),kind,source,config:structuredClone({...config,...(kind==="survey"||kind==="multiple_answer"?{title:{ar:name.trim(),en:name.trim()}}:{})}),population:{...(population.age?{age:Number(population.age)}:{}),sex:population.sex,language:population.language,group:population.group}}
   if(action==="send"&&caseId){if(!draftId)throw new Error(t("احفظ التعديلات أولًا.","Save changes first."));await pb.send(`/api/dsc/cases/${encodeURIComponent(caseId)}/template-assignment`,{method:"POST",body:{draft:draftId},requestKey:null});setNotice(t("تم إرسال التكليف إلى الحالة.","Assignment sent to the case."));onSent?.()}
   else if(action==="draft"&&caseId){const saved=await pb.send<Draft>(`/api/dsc/cases/${encodeURIComponent(caseId)}/template-drafts`,{method:"POST",body:payload,requestKey:null});setDraftId(saved.id);setDrafts(prev=>[saved,...prev]);setNotice(t("حُفظت المسودة. يمكنك إرسالها الآن أو العودة إليها لاحقًا.","Draft saved. Send it now or resume it later."))}
   else{setDraftId("");const saved=await pb.send<Template>("/api/dsc/tool-templates",{method:"POST",body:payload,requestKey:null});setTemplates(prev=>[saved,...prev]);setSource(saved.id);setNotice(privateMode?t("حُفظ قالب خاص بحسابك لاستخدامه لاحقًا.","Saved as a private template for later use."):t("تم حفظ القالب العام.","Public template saved."))}
  }catch(e){setError(getErrorMessage(e,lang))}finally{submitting.current=false;setBusy(false)}
 }
 const ready=!caseId||!!source
 return <section className="space-y-5" dir={ar?"rtl":"ltr"}>
  <h2 className="text-xl font-bold">{caseId?t("اختيار قالب وتعديله","Choose and customize a template"):t("صنع القوالب العامة","Create public templates")}</h2>
  <div className="flex flex-wrap gap-2">{kinds.filter(item=>!lockKind||item.key===initialKind).map(item=><Button key={item.key} type="button" disabled={busy} variant={kind===item.key?"default":"outline"} onClick={()=>changeKind(item.key)}>{ar?item.ar:item.en}</Button>)}</div>
  {loading&&<p role="status">{t("جارٍ تحميل القوالب…","Loading templates…")}</p>}
  <div className="space-y-2"><Label htmlFor="template-source">{t("القالب","Template")}</Label><select id="template-source" className="h-11 w-full rounded border bg-background px-3" disabled={loading||busy} value={source} onChange={e=>e.target.value?void select(e.target.value):changeKind(kind)}><option value="">{caseId?t("اختر قالبًا","Select a template"):t("قالب جديد أو اختر قالبًا لنسخه","New template or select one to copy")}</option>{templates.filter(item=>item.kind===kind).map(item=><option key={item.id} value={item.id}>{item.name} · {item.scope==="private"?t("خاص بي","My private template"):t("عام","Public")}</option>)}</select></div>
  {caseId&&drafts.length>0&&<div className="space-y-2"><Label htmlFor="resume-template-draft">{t("المسودات المحفوظة لهذه الحالة","Saved drafts for this case")}</Label><select id="resume-template-draft" className="h-11 w-full rounded border" value={draftId} disabled={busy} onChange={e=>{const draft=drafts.find(d=>d.id===e.target.value),template=templates.find(item=>item.id===draft?.source);if(!draft||!template)return;generation.current++;setKind(template.kind);setSource(draft.source);setName(draft.name);setConfig(structuredClone(draft.config));setDraftId(draft.id);setPopulation({age:String(draft.population?.age||""),sex:String(draft.population?.sex||""),language:String(draft.population?.language||""),group:String(draft.population?.group||"")});setError("");setNotice("")}}><option value="">{t("اختر مسودة لاستكمالها","Select a draft to resume")}</option>{drafts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>}
  {!caseId&&kind==="assessment"&&!source?<Button asChild><Link href="/dashboard/admin/tools/assessments">{t("صنع مقياس جديد","Build a new assessment")}</Link></Button>:null}
  {caseId&&!source&&!loading&&<p>{t("اختر قالبًا من النوع المحدد لتعديله قبل الإرسال.","Select a template of this type to customize before sending.")}</p>}
  {ready&&(kind!=="assessment"||source)&&<fieldset disabled={busy} className="space-y-4">
   <Label htmlFor="template-name">{t("اسم القالب / التكليف","Template / assignment name")}</Label><Input id="template-name" dir="auto" value={name} maxLength={250} onChange={e=>{setDraftId("");setName(e.target.value)}} />
   {kind==="plan"&&<>{listEditor("goals",t("الأهداف","Goals"))}{listEditor("steps",t("الخطوات","Steps"))}{caseId&&<div className="grid gap-3 sm:grid-cols-2">{text("startDate",t("تاريخ البداية","Start date"))}{text("endDate",t("تاريخ النهاية","End date"))}</div>}</>}
   {kind==="report"&&<>{text("assessment",t("محتوى التقرير","Report content"),true)}{text("suggestions",t("التوصيات","Recommendations"),true)}{listEditor("customFields",t("حقول التقرير","Report fields"),"label")}</>}
   {kind==="survey"&&<><Label htmlFor="survey-answer-type">{t("نوع الإجابة","Answer type")}</Label><select id="survey-answer-type" className="h-10 w-full rounded border" value={String(config.answerType||"single_choice")} onChange={e=>field("answerType",e.target.value)}><option value="single_choice">{t("اختيار واحد","Single choice")}</option><option value="multiple_choice">{t("اختيارات متعددة","Multiple choices")}</option></select>{optionEditor(rows("options"),options=>field("options",options))}{listEditor("questions",t("الأسئلة","Questions"),"text")}</>}
   {kind==="multiple_answer"&&listEditor("questions",t("الأسئلة","Questions"),"text")}
   {kind==="assessment"&&<>{text("instructions",t("تعليمات المقياس","Assessment instructions"),true)}{text("referencePeriod",t("الفترة المرجعية","Reference period"))}<p className="text-sm text-muted-foreground">{t("تعديل نصوص هذه النسخة لا يغيّر المقياس العام أو التكليفات السابقة. تُحفظ قواعد التصحيح مع النسخة.","Changes to this copy do not change the public assessment or previous assignments. Scoring rules are retained in the copy.")}</p>{rows("questions").map((q,i)=><div key={q.id} className="space-y-2"><Label htmlFor={`scale-question-${q.id}`}>{t("السؤال","Question")} {i+1}</Label><Textarea id={`scale-question-${q.id}`} dir="auto" value={String(q.text||"")} onChange={e=>rowChange("questions",i,{text:e.target.value})} /></div>)}{caseId&&<div className="grid gap-3 sm:grid-cols-2">{Object.entries(population).map(([key,value])=><div key={key}><Label htmlFor={`population-${key}`}>{({age:t("العمر","Age"),sex:t("الجنس","Sex"),language:t("اللغة","Language"),group:t("المجموعة المعيارية","Norm group")})[key as keyof typeof population]}</Label><Input id={`population-${key}`} value={value} onChange={e=>{setDraftId("");setPopulation(p=>({...p,[key]:e.target.value}))}} /></div>)}</div>}</>}
   <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={()=>void save("private")}>{privateMode?t("حفظ كقالب خاص بي","Save as my private template"):t("حفظ القالب العام","Save public template")}</Button>{caseId&&<><Button type="button" variant="outline" onClick={()=>void save("draft")}>{t("حفظ التعديلات كمسودة","Save changes as draft")}</Button><Button type="button" disabled={!draftId} onClick={()=>void save("send")}>{t("إرسال إلى الحالة لتعبئته","Send to the case to complete")}</Button></>}</div>
  </fieldset>}
  {error&&<p role="alert" className="text-destructive">{error}</p>}{notice&&<p role="status" className="text-green-700">{notice}</p>}
 </section>
}
