"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, CalendarDays, CloudUpload, Download, Eye, FileAudio, FileImage, FileSpreadsheet, FileText, FileVideo, FolderOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format-date"

export type CaseFileEntry = {
  id: string
  title: string
  filename: string
  description?: string
  created: string
  fromMessage?: boolean
  sizeBytes?: number
}
type Props = {
  ar: boolean
  files: CaseFileEntry[]
  basePath: string
  canUpload?: boolean
  loading?: boolean
  error?: string
  busy?: boolean
  onDownload: (id: string) => void
  onRetry?: () => void
}

export function CaseFileTypeIcon({ filename }: { filename: string }) {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  const style = ext === "pdf" ? "bg-red-50 text-red-600 border-red-100" : ["xls", "xlsx", "csv"].includes(ext) ? "bg-emerald-50 text-emerald-700 border-emerald-100" : ["doc", "docx"].includes(ext) ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-sky-50 text-sky-700 border-sky-100"
  const Icon = ["xls", "xlsx", "csv"].includes(ext) ? FileSpreadsheet : ["png", "jpg", "jpeg", "webp"].includes(ext) ? FileImage : ["mp3", "wav"].includes(ext) ? FileAudio : ext === "mp4" ? FileVideo : FileText
  return <span aria-hidden="true" className={`relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl border ${style}`}><Icon className="size-6" /><span className="absolute -bottom-1 rounded bg-white px-1 text-[8px] font-extrabold uppercase leading-3">{ext.slice(0, 4) || "FILE"}</span></span>
}

export function CaseFilesTable({ ar, files, basePath, canUpload, loading, error, busy, onDownload, onRetry }: Props) {
  const t = (a: string, e: string) => ar ? a : e
  const Back = ar ? ArrowRight : ArrowLeft
  const size = (bytes?: number) => typeof bytes === "number" && Number.isFinite(bytes) && bytes >= 0 ? bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB` : "—"
  return <div dir={ar ? "rtl" : "ltr"} className="min-w-0 space-y-5 text-[#082c4a]">
    <Link href={basePath.replace(/\/files$/, "")} className="inline-flex items-center gap-2 text-sm font-medium text-[#315e85] hover:underline"><Back className="size-4" />{t("العودة إلى التكليفات", "Back to assignments")}</Link>
    <section aria-label={t("ملفات الحالة", "Case files")} className="min-w-0 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_3px_8px_#1648800c] sm:p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4 px-1"><h2 className="inline-flex items-center gap-3 text-xl font-bold sm:text-2xl"><FolderOpen className="size-8 text-[#073d6b]" />{t("ملفات الحالة", "Case files")}<span className="rounded-lg bg-blue-50 px-2 py-1 text-xs text-[#38658b]">{files.length}</span></h2>{canUpload && <Button asChild className="min-h-11 rounded-xl bg-[#005bb9] px-4 font-bold shadow-sm hover:bg-[#004d9d]"><Link href={`${basePath}/new`}><Plus className="size-5" />{t("إضافة ملف", "Add file")}</Link></Button>}</header>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">{error}{onRetry && <Button variant="link" onClick={onRetry}>{t("إعادة المحاولة", "Retry")}</Button>}</div>}
      {loading ? <p role="status" className="rounded-xl bg-blue-50 p-8 text-center text-sm">{t("جارٍ تحميل الملفات…", "Loading files…")}</p> : files.length ? <>
        <p className="mb-2 text-xs text-slate-600 lg:hidden">{t("مرّر الجدول أفقيًا لعرض جميع التفاصيل والإجراءات.", "Scroll the table horizontally to view all details and actions.")}</p>
        <div role="region" aria-label={t("جدول ملفات الحالة", "Case files table")} tabIndex={0} className="max-w-full overflow-x-auto rounded-xl border border-blue-100 focus-visible:outline-2 focus-visible:outline-blue-500">
          <table className="w-full min-w-[980px] border-collapse text-start text-sm">
            <thead className="bg-[#e2edfc] text-[#082f57]"><tr>{["#", t("اسم الملف", "File name"), t("الوصف", "Description"), t("تاريخ الإضافة", "Added on"), t("المصدر", "Source"), t("الحجم", "Size"), t("الإجراءات", "Actions")].map((label, i) => <th key={label} scope="col" className={`px-4 py-4 text-start font-bold ${i === 0 ? "w-12" : ""}`}>{i === 3 ? <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" />{label}</span> : label}</th>)}</tr></thead>
            <tbody>{files.map((file, index) => <tr key={file.id} className="border-t border-blue-50 bg-white even:bg-[#f2f7ff] hover:bg-blue-50/80"><td className="px-4 py-4 text-center font-medium">{index + 1}</td><td className="max-w-[300px] px-4 py-4"><Link href={`${basePath}/${encodeURIComponent(file.id)}`} className="group inline-flex items-center gap-3 rounded-md font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><CaseFileTypeIcon filename={file.filename} /><span dir="auto" className="[overflow-wrap:anywhere] group-hover:text-blue-700 group-hover:underline">{file.title || file.filename}</span></Link></td><td className="max-w-[290px] px-4 py-4"><p dir="auto" className="line-clamp-2 leading-6 text-[#264b6b]">{file.description || "—"}</p></td><td className="whitespace-nowrap px-4 py-4 text-xs font-medium"><bdi>{formatDateTime(file.created) || "—"}</bdi></td><td className="whitespace-nowrap px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${file.fromMessage ? "bg-violet-100 text-violet-800" : "bg-[#d8ecff] text-[#0759a7]"}`}>{file.fromMessage ? t("من رسالة", "From message") : t("ملف مرفوع", "Uploaded file")}</span></td><td className="whitespace-nowrap px-4 py-4 text-xs font-medium"><bdi title={file.sizeBytes === undefined ? t("حجم الملف غير مسجل", "File size is not recorded") : undefined}>{size(file.sizeBytes)}</bdi></td><td className="px-3 py-4"><div className="flex items-center gap-1"><Button asChild variant="ghost" size="icon" className="rounded-xl border border-blue-100 bg-white text-blue-700 shadow-sm"><Link href={`${basePath}/${encodeURIComponent(file.id)}`} aria-label={`${t("عرض تفاصيل", "View details for")} ${file.title || file.filename}`} title={t("عرض التفاصيل", "View details")}><Eye className="size-5" /></Link></Button><Button type="button" variant="ghost" size="icon" disabled={busy} aria-label={`${t("تنزيل", "Download")} ${file.title || file.filename}`} title={t("تنزيل الملف", "Download file")} onClick={() => onDownload(file.id)} className="rounded-xl text-blue-700 hover:bg-white"><Download className="size-5" /></Button></div></td></tr>)}</tbody>
          </table>
        </div>
      </> : !error && <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-[#f8fbff] px-6 py-14 text-center"><FolderOpen className="size-12 text-blue-300" /><h3 className="font-bold">{t("لا توجد ملفات لهذه الحالة بعد", "No files for this case yet")}</h3><p className="text-sm text-slate-600">{t("ستظهر الملفات المحفوظة والمرفقات هنا.", "Saved files and attachments will appear here.")}</p></div>}
    </section>
    {canUpload && <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_3px_8px_#1648800c]"><Link href={`${basePath}/new`} className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#8eb6ec] bg-[#f5f9ff] px-5 py-6 text-center transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><CloudUpload className="size-10 text-[#005bb9]" /><span className="text-lg font-bold">{t("إضافة ملف جديد إلى الحالة", "Add a new file to this case")} <span className="text-[#005bb9] underline underline-offset-4">{t("اختيار ملف", "Choose a file")}</span></span><span className="text-sm leading-6 text-[#395c7b]">{t("يفتح نموذج الإضافة لإدخال اسم الملف ووصفه قبل الحفظ. الحد الأقصى: 10 ميغابايت لكل ملف.", "Open the upload form to add a title and description before saving. Maximum: 10 MB per file.")}</span><span className="text-xs text-[#55718b]">PDF · Word · Excel · {t("صور وملفات صوت وفيديو", "Images, audio and video")}</span></Link></section>}
  </div>
}
