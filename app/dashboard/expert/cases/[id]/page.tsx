"use client"
import { TemplateResponse } from "@/components/tools/TemplateResponse"
import { AttachmentAssignmentDetail, isAttachmentRequest } from "@/components/cases/AttachmentAssignmentDetail"
import { CaseDocuments } from "@/components/cases/CaseDocuments"
import { ExpertCreateAssignment } from "@/components/cases/ExpertCreateAssignment"
import type { MultipleChoiceConfig } from "@/types/tool"
import { CaseAssignmentsWorkspace, type WorkspaceAssignment } from "@/components/cases/CaseAssignmentsWorkspace"
import { AssignmentAssessmentDetail } from "@/components/cases/AssignmentAssessmentDetail"
import type { SessionRecord } from "@/lib/assessments/types"
import { ClipboardCheck, ClipboardList, ExternalLink, Paperclip } from "lucide-react"
import { CaseAssessments } from "@/components/assessments/CaseAssessments"
import { CaseFeedback } from "@/components/cases/CaseFeedback"
import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useToolTypes } from "@/hooks/useToolTypes"
import { getToolTypeMeta, getToolTypeLabel } from "@/lib/tool-types"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import pb, { getErrorMessage } from "@/lib/pb"
import { specializationLabel } from "@/components/team/team-labels"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CaseTool } from "@/types/assignment"
import { toast } from "sonner"
function TaskResponse({
  task,
  save,
}: {
  task: CaseTool
  save: (id: string, data: Partial<CaseTool>) => Promise<void>
}) {
  const { lang } = useLang()
  const ar = lang === "ar"
  const [note, setNote] = useState(
    typeof task.responses?.expert_note === "string"
      ? task.responses.expert_note
      : ""
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  async function submit(status: CaseTool["status"]) {
    if (saving) return
    setSaving(true)
    setError("")
    try {
      await save(task.id, {
        responses: { ...task.responses, expert_note: note.trim() },
        status,
      })
      toast.success(ar ? "تم تحديث التكليف" : "Assignment updated")
    } catch (e) {
      setError(getErrorMessage(e, lang))
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="space-y-3">
      <Label htmlFor={`note-${task.id}`}>
        {ar ? "ملاحظات التنفيذ" : "Progress notes"}
      </Label>
      <Textarea
        id={`note-${task.id}`}
        maxLength={3000}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={saving}
          variant="outline"
          onClick={() => submit("in_progress")}
        >
          {ar ? "حفظ التقدم" : "Save progress"}
        </Button>
        <Button disabled={saving} onClick={() => submit("completed")}>
          {ar ? "إكمال التكليف" : "Complete assignment"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
export default function ExpertCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { profiles, isLoading, loadError, refresh } = useProfiles()
  const {
    assignments,
    isLoading: tasksLoading,
    loadError: taskError,
    updateAssignment,
    refresh: refreshTasks,
  } = useAssignments(id)
  const { toolTypes, fetchToolTypes } = useToolTypes()
  useEffect(() => { void fetchToolTypes() }, [fetchToolTypes])
  const { currentUser } = useAuth()
  const { lang } = useLang()
  const ar = lang === "ar"
  const [assessmentData, setAssessmentData] = useState<{caseId: string; sessions: SessionRecord[]}>({caseId: "", sessions: []})
  const assessmentSessions = assessmentData.caseId === id ? assessmentData.sessions : []
  const [assessmentError, setAssessmentError] = useState("")
  const [assessmentReload, setAssessmentReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    pb.send<{sessions: SessionRecord[]}>(`/api/dsc/cases/${encodeURIComponent(id)}/assessments`, { method: "GET", signal: controller.signal, requestKey: null })
      .then(data => { setAssessmentData({caseId: id, sessions: data.sessions}); setAssessmentError("") })
      .catch(error => { if (!controller.signal.aborted) setAssessmentError(getErrorMessage(error, lang)) })
    return () => controller.abort()
  }, [id, lang, assessmentReload])
  if (isLoading || tasksLoading) return <PageLoader />
  if (loadError || taskError)
    return (
      <DataError
        message={loadError || taskError}
        onRetry={() => {
          refresh()
          refreshTasks()
        }}
      />
    )
  const profile = profiles.find((p) => p.id === id)
  if (!profile)
    return (
      <p role="alert">
        {ar ? "الحالة غير متاحة لك." : "This case is not available to you."}
      </p>
    )
  function toolIcon(task: CaseTool) {
    const record = toolTypes.find(type => type.id === task.type)
    const kind = String((task.config as unknown as Record<string, unknown>)?.templateKind || record?.key || "")
    const Icon = isAttachmentRequest(task) ? Paperclip : getToolTypeMeta(kind)?.icon || ClipboardList
    const label = isAttachmentRequest(task) ? (ar ? "طلب مرفقات" : "Attachment request") : record ? getToolTypeLabel(record, lang) : (ar ? "أداة" : "Tool")
    return <span role="img" aria-label={label} title={label}><Icon aria-hidden="true" className="size-4" /></span>
  }
  const items: WorkspaceAssignment[] = assignments.map(task => ({
    id: `tool:${task.id}`,
    icon: toolIcon(task),
    name: (ar ? task.name_ar : task.name_en) || task.name_en || task.name_ar || (ar ? "تكليف" : "Assignment"),
    status: task.status,
    date: task.assigned_at || task.created,
    category: task.specialization ? specializationLabel(task.specialization, lang) : undefined,
    content: <div className="space-y-5">
      {isAttachmentRequest(task) && <AttachmentAssignmentDetail task={task} ar={ar} />}
      {(task.config as unknown as Record<string, unknown>)?.templateWorkflow === true && ["plan", "report"].includes(String((task.config as unknown as Record<string, unknown>)?.templateKind || "")) && <TemplateResponse task={task} kind={String((task.config as unknown as Record<string, unknown>)?.templateKind || "")} readOnly />}
      {task.task_brief && <p dir="auto" className="rounded-xl bg-blue-50 p-4 text-sm leading-7 whitespace-pre-wrap [overflow-wrap:anywhere]">{task.task_brief}</p>}
      {!task.task_brief && (task.config as Partial<MultipleChoiceConfig> | undefined)?.questions?.map((question, index) => <section key={question.id} className="rounded-xl border border-blue-100 bg-[#f3f8ff] p-4"><div className="flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-bold text-blue-700">{index + 1}</span><p dir="auto" className="text-sm font-semibold leading-7 whitespace-pre-wrap">{question.text}</p></div>{typeof task.responses?.[question.id] === "string" && <div className="mt-3 rounded-lg bg-white p-3"><p className="text-xs font-semibold text-slate-500">{ar ? "إجابة صاحب الحالة" : "Case owner's answer"}</p><p dir="auto" className="mt-1 text-sm whitespace-pre-wrap">{String(task.responses[question.id])}</p></div>}</section>)}
      {task.assigned_expert === currentUser?.id && <TaskResponse key={task.id} task={task} save={updateAssignment} />}
    </div>,
    actions: isAttachmentRequest(task) ? undefined : <Button asChild variant="outline" className="min-h-11 border-blue-200 text-blue-800"><Link href={`/dashboard/admin/assignments/${encodeURIComponent(task.id)}`}><ExternalLink className="size-4" />{ar ? "عرض الأداة والإجابات" : "View tool and responses"}</Link></Button>,
  }))
  items.push(...assessmentSessions.map(session => ({
    icon: <span role="img" aria-label={ar ? "مقياس / تقييم" : "Assessment"} title={ar ? "مقياس / تقييم" : "Assessment"}><ClipboardCheck aria-hidden="true" className="size-4" /></span>,
    id: `assessment:${session.id}`, name: session.snapshot.name, status: session.status,
    date: session.assigned_at || session.created, category: ar ? "مقياس / تقييم" : "Assessment",
    content: <AssignmentAssessmentDetail key={session.id} id={session.id} ar={ar} />,
    actions: <span className="inline-flex items-center gap-2 text-xs text-slate-600"><ClipboardCheck className="size-4" />{ar ? "التقرير الكامل متاح من تبويب النتائج والتقارير." : "Full reports are available in Results & reports."}</span>,
  })))
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const ownerLabel = profile.owner_display?.type === "parent" ? (ar ? "ولي الأمر" : "Parent") : (ar ? "الجهة التابعة لها الحالة" : "Case organization")
  return <>
    {assessmentError && <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{ar ? "تعذر تحميل تكليفات المقاييس: " : "Could not load assessments: "}{assessmentError}<Button variant="link" onClick={() => setAssessmentReload(value => value + 1)}>{ar ? "إعادة المحاولة" : "Retry"}</Button></p>}
    <CaseAssignmentsWorkspace key={id} ar={ar} caseName={profile.name} caseId={profile.id}
      ownerName={profile.owner_display?.name || profile.user_details?.name} ownerLabel={ownerLabel} phone={profile.user_details?.contact}
      items={items}
      documents={<CaseDocuments caseId={profile.id} mode="list" basePath={`/dashboard/expert/cases/${encodeURIComponent(profile.id)}/files`} />}
      results={<CaseAssessments key={`results-${assessmentReload}`} caseId={profile.id} mode="list" />}
      feedback={<CaseFeedback caseId={profile.id} ownerId={profile.user} />}
      create={<ExpertCreateAssignment caseId={profile.id} embedded onCreated={() => { void refreshTasks(); setAssessmentReload(value => value + 1) }} />}
    />
  </>
}
