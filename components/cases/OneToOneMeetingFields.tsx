"use client"

import { FileText, LockKeyhole } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/format-date"
import { sessionTypes, type MeetingDraft } from "@/lib/meeting-assignment"

type Props = {
  ar: boolean; value: MeetingDraft; onChange: (value: MeetingDraft) => void
  idPrefix: string; assignedAt?: string; readOnly?: boolean
}

export function OneToOneMeetingFields({ ar, value, onChange, idPrefix, assignedAt, readOnly = false }: Props) {
  const t = (a: string, e: string) => ar ? a : e
  const id = (field: string) => `${idPrefix}-${field}`
  const set = <K extends keyof MeetingDraft>(field: K, next: MeetingDraft[K]) => onChange({ ...value, [field]: next })
  const inputClass = "h-11 rounded-xl border-blue-200 bg-white px-3 text-[#082c4a] shadow-none"
  return <div className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">
      {assignedAt && <div className="space-y-2"><Label htmlFor={id("assigned")}>{t("تاريخ التكليف", "Assigned on")}</Label><Input id={id("assigned")} value={formatDate(assignedAt) || "—"} readOnly className={`${inputClass} bg-blue-50/40`} /></div>}
      <div className={`space-y-2 ${assignedAt ? "" : "sm:col-span-2"}`}><Label htmlFor={id("title")}>{t("عنوان الجلسة", "Session title")} {!readOnly && <span className="text-red-700">*</span>}</Label><Input id={id("title")} required maxLength={200} value={value.title} readOnly={readOnly} onChange={e => set("title", e.target.value)} className={inputClass} /></div>
      <div className="space-y-2"><Label htmlFor={id("session-type")}>{t("نوع الجلسة", "Session type")} {!readOnly && <span className="text-red-700">*</span>}</Label><select id={id("session-type")} value={value.sessionType} disabled={readOnly} onChange={e => set("sessionType", e.target.value)} className={`${inputClass} w-full border text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-100`}>
        {!sessionTypes.some(type => type.value === value.sessionType) && <option value={value.sessionType}>{value.sessionType}</option>}
        {sessionTypes.map(type => <option key={type.value} value={type.value}>{ar ? type.ar : type.en}</option>)}
      </select></div>
      <fieldset className="min-w-0 space-y-3"><legend className="text-sm font-medium">{t("وضع الجلسة", "Session mode")} {!readOnly && <span className="text-red-700">*</span>}</legend><div className="flex min-h-11 flex-wrap items-center gap-x-7 gap-y-2">{([{ value: "online", label: t("عن بعد", "Online") }, { value: "face_to_face", label: t("حضورية", "In person") }] as const).map(mode => <label key={mode.value} className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm font-semibold"><input type="radio" name={id("mode")} value={mode.value} checked={value.meetingType === mode.value} disabled={readOnly} onChange={() => set("meetingType", mode.value)} className="size-5 accent-blue-700" />{mode.label}</label>)}</div></fieldset>
      <div className="space-y-2"><Label htmlFor={id("date")}>{t("موعد الجلسة", "Session date")} {!readOnly && <span className="text-red-700">*</span>}</Label><DateInput id={id("date")} required value={value.date} onChange={date => set("date", date)} readOnly={readOnly} className={`${inputClass} !w-full !max-w-none`} /></div>
      <div className="space-y-2"><Label htmlFor={id("time")}>{t("وقت الجلسة", "Session time")} {!readOnly && <span className="text-red-700">*</span>}</Label><Input id={id("time")} type="time" required value={value.time} readOnly={readOnly} onChange={e => set("time", e.target.value)} className={inputClass} /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor={id("place")}>{value.meetingType === "online" ? t("رابط الجلسة", "Session link") : t("مكان الجلسة", "Session location")}</Label><Input id={id("place")} type={value.meetingType === "online" ? "url" : "text"} dir={value.meetingType === "online" ? "ltr" : "auto"} value={value.meetingType === "online" ? value.meetingLink : value.location} readOnly={readOnly} onChange={e => set(value.meetingType === "online" ? "meetingLink" : "location", e.target.value)} placeholder={value.meetingType === "online" ? "https://…" : t("أدخل مكان انعقاد الجلسة", "Enter session location")} className={inputClass} /></div>
    </div>
    {readOnly && value.meetingType === "online" && /^https?:\/\//i.test(value.meetingLink) && <a href={value.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl border border-blue-200 px-4 text-sm font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600">{t("فتح رابط الجلسة", "Open session link")}</a>}
    <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm"><h3 className="flex items-center gap-2 bg-[#e7f1ff] px-4 py-2.5 text-sm font-bold"><FileText className="size-4 text-blue-700" /><Label htmlFor={id("description")} className="font-bold">{t("وصف الجلسة", "Session description")}</Label></h3><div className="p-3"><Textarea id={id("description")} value={value.description} readOnly={readOnly} onChange={e => set("description", e.target.value)} rows={3} maxLength={5000} placeholder={t("أهداف الجلسة والموضوعات التي ستتم مناقشتها…", "Session goals and topics to discuss…")} className="min-h-24 rounded-xl border-blue-200 text-sm leading-7 shadow-none" /></div></section>
    <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm"><h3 className="flex items-center gap-2 bg-[#e7f1ff] px-4 py-2.5 text-sm font-bold"><LockKeyhole className="size-4 text-blue-700" /><Label htmlFor={id("notes")} className="font-bold">{t("ملاحظات داخلية", "Internal notes")}</Label></h3><div className="space-y-3 p-3"><Textarea id={id("notes")} value={value.notes} readOnly={readOnly} onChange={e => set("notes", e.target.value)} rows={3} maxLength={5000} placeholder={t("ملاحظات لا تظهر لولي الأمر…", "Notes hidden from the case owner…")} className="min-h-24 rounded-xl border-blue-200 text-sm leading-7 shadow-none" /><label className="inline-flex min-h-10 items-center gap-2 text-xs leading-6 text-slate-600"><input type="checkbox" checked={value.notesVisibleToUser} disabled={readOnly} onChange={e => set("notesVisibleToUser", e.target.checked)} className="size-4 accent-blue-700" />{t("إظهار الملاحظات لصاحب الحالة", "Show notes to the case owner")}</label><p className="text-xs text-slate-600">{value.notesVisibleToUser ? t("هذه الملاحظات مرئية لصاحب الحالة.", "These notes are visible to the case owner.") : t("هذه الملاحظات داخلية ولا تظهر لصاحب الحالة.", "These notes are internal and hidden from the case owner.")}</p></div></section>
  </div>
}
