"use client"

import { Paperclip } from "lucide-react"
import { ProtectedFileLink } from "@/components/ProtectedFileLink"
import pb from "@/lib/pb"
import type { CaseTool } from "@/types/assignment"
import type { AttachmentRequestConfig } from "@/types/tool"

export function isAttachmentRequest(task: CaseTool) {
  const config = task.config as Partial<AttachmentRequestConfig> | undefined
  return Array.isArray(config?.allowedTypes) && typeof config.maxFiles === "number" && typeof config.maxFileSize === "number"
}

export function AttachmentAssignmentDetail({ task, ar }: { task: CaseTool; ar: boolean }) {
  const config = task.config as AttachmentRequestConfig
  const types: Record<string, string> = ar
    ? { image: "صور", document: "مستندات", video: "فيديو", audio: "صوت", any: "جميع الأنواع" }
    : { image: "Images", document: "Documents", video: "Video", audio: "Audio", any: "All types" }
  const title = config.title?.[ar ? "ar" : "en"] || config.title?.en || config.title?.ar
  return <div className="space-y-5">
    <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
      <h3 dir="auto" className="font-bold">{title || (ar ? "طلب مرفقات" : "Attachment request")}</h3>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">{ar ? "الأنواع المسموح بها" : "Allowed file types"}</dt><dd className="mt-1 font-medium">{config.allowedTypes.map(type => types[type] || type).join(ar ? "، " : ", ")}</dd></div>
        <div><dt className="text-slate-500">{ar ? "الحد الأقصى للملفات" : "Maximum files"}</dt><dd className="mt-1 font-medium">{config.maxFiles}</dd></div>
        <div><dt className="text-slate-500">{ar ? "الحد الأقصى لحجم الملف" : "Maximum file size"}</dt><dd className="mt-1 font-medium">{config.maxFileSize} {ar ? "ميغابايت" : "MB"}</dd></div>
        <div><dt className="text-slate-500">{ar ? "مطلوب" : "Required"}</dt><dd className="mt-1 font-medium">{config.required ? (ar ? "نعم" : "Yes") : (ar ? "لا" : "No")}</dd></div>
      </dl>
    </section>
    <section className="space-y-3"><h3 className="font-bold">{ar ? "الملفات المقدمة من صاحب الحالة" : "Files submitted by the case owner"}</h3>
      {task.media?.length ? <ul className="space-y-2">{task.media.map(file => {
        let href = pb.files.getURL({ collectionId: "case_tools", id: task.id }, file)
        if (/^https?:\/\//i.test(file)) {
          try {
            const url = new URL(file)
            if (url.origin !== new URL(pb.baseURL).origin || !url.pathname.includes("/api/files/")) return null
            href = url.toString()
          } catch { return null }
        }
        return <li key={file} className="rounded-xl border border-blue-100 p-3"><ProtectedFileLink href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-700 underline underline-offset-4"><Paperclip className="size-4 shrink-0" /><span dir="auto" className="[overflow-wrap:anywhere]">{file.split("/").pop()}</span></ProtectedFileLink></li>
      })}</ul> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{ar ? "لم يرفع صاحب الحالة أي ملفات بعد." : "The case owner has not uploaded any files yet."}</p>}
    </section>
  </div>
}
