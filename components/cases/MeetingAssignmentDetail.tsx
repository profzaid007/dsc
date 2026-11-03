"use client"

import { useState } from "react"
import { Check, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { OneToOneMeetingFields } from "@/components/cases/OneToOneMeetingFields"
import { isMeetingDraftValid, meetingConfig, meetingDraft } from "@/lib/meeting-assignment"
import { getErrorMessage } from "@/lib/pb"
import type { CaseTool } from "@/types/assignment"
import type { OneToOneMeetingConfig } from "@/types/tool"

export function MeetingAssignmentDetail({ task, ar, save }: { task: CaseTool; ar: boolean; save: (id: string, data: Partial<CaseTool>) => Promise<void> }) {
  const config = task.config as OneToOneMeetingConfig | undefined
  const title = (ar ? task.name_ar : task.name_en) || task.name_ar || task.name_en || ""
  const [draft, setDraft] = useState(() => meetingDraft(title, config))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const canEdit = task.can_edit_configuration === true && task.status !== "completed"
  const reset = () => { setDraft(meetingDraft(title, config)); setError("") }
  return <form onSubmit={async event => {
    event.preventDefault()
    if (!canEdit || saving || !isMeetingDraftValid(draft)) return
    setSaving(true); setError("")
    try {
      await save(task.id, { name_ar: draft.title.trim(), name_en: draft.title.trim(), config: meetingConfig(draft, config) })
      toast.success(ar ? "تم حفظ الجلسة" : "Session saved")
    } catch (err) { setError(getErrorMessage(err, ar ? "ar" : "en")) }
    finally { setSaving(false) }
  }} className="space-y-5">
    <OneToOneMeetingFields ar={ar} value={draft} onChange={setDraft} idPrefix={`session-${task.id}`} assignedAt={task.assigned_at || task.created} readOnly={!canEdit || saving} />
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {canEdit ? <div className="flex flex-wrap justify-end gap-3"><Button type="button" variant="outline" disabled={saving} onClick={reset} className="min-h-12 rounded-xl border-blue-200 px-6 text-[#073d6b]"><X className="size-4" />{ar ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={saving || !isMeetingDraftValid(draft)} className="min-h-12 rounded-xl bg-[#073d6b] px-6 font-bold hover:bg-[#062f52]">{saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ التكليف" : "Save assignment")}</Button></div> : <p className="text-xs leading-6 text-slate-600">{ar ? "تفاصيل الجلسة للعرض فقط. يتاح التعديل لمنشئ التكليف وفق الصلاحيات وقبل اكتماله." : "Session details are read only. The assignment creator may edit it when permitted and before completion."}</p>}
  </form>
}
