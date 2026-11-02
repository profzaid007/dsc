"use client"
import { useState } from "react"
import Link from "next/link"
import { Mail, Paperclip, Calendar } from "lucide-react"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
import { TemplateWorkspace } from "@/components/tools/TemplateWorkspace"

export function ExpertCreateAssignment({caseId,onCreated,embedded=false}:{caseId:string;onCreated:()=>void;embedded?:boolean}){
 const {lang}=useLang(),ar=lang==="ar"
 const [open,setOpen]=useState(false)
 return <section className="space-y-4">
  {!embedded&&<Button type="button" aria-expanded={open} aria-controls="expert-template-assignment" onClick={()=>setOpen(value=>!value)}>{ar?"إضافة تكليف من قالب":"Assign from a template"}</Button>}
  {(embedded||open)&&<div id="expert-template-assignment" className={embedded?"":"rounded-xl border bg-white p-5"}><TemplateWorkspace caseId={caseId} onSent={onCreated} /></div>}
  <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 font-semibold">{ar?"إجراءات لا تحتاج إلى قالب":"Actions without a template"}</h3><div className="flex flex-wrap gap-3">
   <Button asChild variant="outline"><Link href={`/dashboard/messages?case=${encodeURIComponent(caseId)}&compose=1`}><Mail className="size-4" />{ar?"إرسال رسالة":"Send message"}</Link></Button>
   <Button asChild variant="outline"><Link href={`/dashboard/admin/tools/one-to-one-meeting/new?caseId=${encodeURIComponent(caseId)}`}><Calendar className="size-4" />{ar?"طلب جلسة":"Request a session"}</Link></Button>
   <Button asChild variant="outline"><Link href={`/dashboard/admin/tools/attachment-request/new?caseId=${encodeURIComponent(caseId)}`}><Paperclip className="size-4" />{ar?"طلب مرفقات":"Request attachments"}</Link></Button>
  </div></div>
 </section>
}
