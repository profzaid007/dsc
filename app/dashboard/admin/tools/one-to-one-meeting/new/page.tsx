"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Check, Eye, EyeOff, Loader2, UsersRound, X } from "lucide-react"
import { toast } from "sonner"
import { caseTaskPath } from "@/lib/case-task-path"
import { useAssignments } from "@/hooks/useAssignments"
import { useAuth } from "@/hooks/useAuth"
import { useProfiles } from "@/hooks/useProfiles"
import { toolTypesCollection } from "@/lib/pb-collections"
import { getErrorMessage } from "@/lib/pb"
import { useLang } from "@/lib/lang-context"
import { isMeetingDraftValid, meetingConfig, meetingDraft } from "@/lib/meeting-assignment"
import { Button } from "@/components/ui/button"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import { OneToOneMeetingFields } from "@/components/cases/OneToOneMeetingFields"
import type { OneToOneMeetingConfig } from "@/types/tool"
import type { CaseTool } from "@/types/assignment"

export default function OneToOneMeetingNewPage({ searchParams }: { searchParams: Promise<{ caseId?: string; edit?: string }> }) {
  const router = useRouter()
  const { lang } = useLang()
  const ar = lang === "ar"
  const t = (a: string, e: string) => ar ? a : e
  const { currentUser } = useAuth()
  const { assignTool, updateAssignment, assignments, isLoading, loadError } = useAssignments()
  const { getProfileById } = useProfiles()
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [typeId, setTypeId] = useState("")
  const [error, setError] = useState("")
  const [initialError, setInitialError] = useState("")
  const [existing, setExisting] = useState<CaseTool>()
  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [hasCaseContext, setHasCaseContext] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const initialized = useRef(false)
  const [draft, setDraft] = useState(() => meetingDraft())

  useEffect(() => {
    let active = true
    toolTypesCollection.getByName("one_to_one_meeting").then(type => { if (active) setTypeId(type.id) }).catch(err => { if (active) setInitialError(getErrorMessage(err, lang)) })
    return () => { active = false }
  }, [lang])

  useEffect(() => {
    if (isLoading || initialized.current) return
    let active = true
    searchParams.then(params => {
      if (!active) return
      initialized.current = true
      setHasCaseContext(Boolean(params.caseId || params.edit))
      if (params.edit) {
        const assignment = assignments.find(item => item.id === params.edit)
        if (!assignment) { setInitialError(ar ? "الجلسة غير متاحة للتعديل." : "This session is not available to edit."); return }
        setExisting(assignment)
        setSelectedCaseId(assignment.case)
        setDraft(meetingDraft((ar ? assignment.name_ar : assignment.name_en) || assignment.name_ar || assignment.name_en || "", assignment.config as OneToOneMeetingConfig))
      } else if (params.caseId) {
        setSelectedCaseId(params.caseId)
        const profile = getProfileById(params.caseId)
        setDraft(meetingDraft(profile ? `${profile.name} - ${ar ? "جلسة فردية" : "Individual session"}` : (ar ? "جلسة فردية" : "Individual session")))
      }
    }).catch(err => { if (active) setInitialError(getErrorMessage(err, lang)) }).finally(() => { if (active) setInitializing(false) })
    return () => { active = false }
  }, [isLoading, assignments, searchParams, getProfileById, ar, lang])

  const mayEdit = !existing || currentUser?.role !== "expert" || (existing.can_edit_configuration === true && existing.status !== "completed")
  const canSave = Boolean(selectedCaseId && typeId && isMeetingDraftValid(draft) && mayEdit)
  const profile = getProfileById(selectedCaseId)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSave || saving) return
    setSaving(true); setError("")
    try {
      const config = meetingConfig(draft, existing?.config as OneToOneMeetingConfig | undefined)
      if (existing) {
        await updateAssignment(existing.id, { name_ar: draft.title.trim(), name_en: draft.title.trim(), config })
      } else {
        await assignTool({ case: selectedCaseId, type: typeId, name_ar: draft.title.trim(), name_en: draft.title.trim(), is_not_template: true, config, is_visible_to_user: true, status: "pending" })
      }
      toast.success(t("تم حفظ الجلسة", "Session saved"))
      router.push(caseTaskPath(selectedCaseId, existing?.id))
    } catch (err) { setError(getErrorMessage(err, lang)) }
    finally { setSaving(false) }
  }
  function cancel() {
    if (selectedCaseId && hasCaseContext) router.push(caseTaskPath(selectedCaseId, existing?.id))
    else { setSelectedCaseId(""); setDraft(meetingDraft()); setError(""); setShowPreview(false) }
  }

  if (initializing || isLoading) return <p className="py-12 text-center text-slate-600">{t("جارٍ تحميل الجلسة…", "Loading session…")}</p>
  if (initialError || loadError) return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{initialError || loadError}</p>
  return <div dir={ar ? "rtl" : "ltr"} className="mx-auto max-w-6xl space-y-6 text-[#082c4a]">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-1 text-xs font-semibold text-[#51708c]">{t("الحالات المتخصصة / التكليفات", "Specialist cases / Assignments")}</p><h1 className="text-2xl font-bold">{existing ? t("تعديل الجلسة الفردية", "Edit individual session") : t("جلسة فردية جديدة", "New individual session")}</h1></div><Button type="button" variant="outline" onClick={() => setShowPreview(value => !value)} className="min-h-11 rounded-xl border-blue-200 text-[#073d6b]">{showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{showPreview ? t("إخفاء المعاينة", "Hide preview") : t("معاينة الجلسة", "Preview session")}</Button></header>
    <section aria-label={t("الحالة", "Case")} className="space-y-3 rounded-2xl border border-blue-200 bg-[#edf5ff] p-5"><div className="flex items-center gap-2 text-sm font-bold"><UsersRound className="size-5 text-blue-700" />{t("اسم الحالة", "Case name")}</div><CaseSearchCombobox readOnly={hasCaseContext} value={selectedCaseId} onChange={caseId => { setSelectedCaseId(caseId); const selected = getProfileById(caseId); setDraft(value => ({ ...value, title: selected ? `${selected.name} - ${t("جلسة فردية", "Individual session")}` : "" })) }} placeholder={t("اختر حالة…", "Select a case…")} disabled={Boolean(existing)} />{profile && <p className="text-xs text-[#51708c]">{t("رقم الحالة", "Case ID")}: <bdi>{profile.id}</bdi></p>}</section>
    <div className={`grid items-start gap-6 ${showPreview ? "xl:grid-cols-2" : ""}`}>
      <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm"><h2 className="flex items-center gap-3 bg-[#073d6b] px-5 py-4 text-lg font-bold text-white"><UsersRound className="size-6" />{t("تفاصيل الجلسة", "Session details")}</h2><form onSubmit={submit} className="space-y-5 p-5"><OneToOneMeetingFields ar={ar} value={draft} onChange={setDraft} idPrefix="meeting-builder" assignedAt={existing?.assigned_at || existing?.created} readOnly={!mayEdit || saving} />{!mayEdit && <p className="text-sm text-amber-800">{t("لا تملك صلاحية تعديل هذا التكليف.", "You do not have permission to edit this assignment.")}</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<footer className="flex flex-wrap justify-end gap-3"><Button type="button" variant="outline" onClick={cancel} disabled={saving} className="min-h-12 rounded-xl border-blue-200 px-6"><X className="size-4" />{t("إلغاء", "Cancel")}</Button><Button type="submit" disabled={!canSave || saving} className="min-h-12 rounded-xl bg-[#073d6b] px-6 font-bold hover:bg-[#062f52]">{saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{saving ? t("جارٍ الحفظ…", "Saving…") : t("حفظ التكليف", "Save assignment")}</Button></footer></form></section>
      {showPreview && <aside className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm"><h2 className="flex items-center gap-2 border-b border-blue-100 bg-[#edf5ff] px-5 py-4 font-bold"><CalendarDays className="size-5 text-blue-700" />{t("معاينة الجلسة", "Session preview")}</h2><div className="p-5"><OneToOneMeetingFields ar={ar} value={draft} onChange={() => {}} idPrefix="meeting-preview" assignedAt={existing?.assigned_at || existing?.created} readOnly /></div></aside>}
    </div>
  </div>
}
