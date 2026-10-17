"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientAssessmentList } from "./ClientAssessments"
import type { SessionRecord } from "@/lib/assessments/types"

type CaseData = {
  sessions: SessionRecord[]
  assessments: { id: string; name: string; version: string }[]
  canAssign: boolean
}
const selectStyle =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
type CaseAssessmentProps = { caseId: string; mode?: "all" | "assign" | "list"; assignmentRows?: ReactNode; onAssigned?: () => void; onCountChange?: (count: number) => void }
export function CaseAssessments(props: CaseAssessmentProps) {
  const { caseId } = props
  const { currentUser, isLoading } = useAuth()
  if (isLoading) return null
  const professional =
    currentUser && ["admin", "super_admin", "expert"].includes(currentUser.role)
  return professional ? (
    <ProfessionalCaseAssessments key={caseId} {...props} />
  ) : (
    <ClientAssessmentList caseId={caseId} />
  )
}
function ProfessionalCaseAssessments({ caseId, mode = "all", assignmentRows, onAssigned, onCountChange }: CaseAssessmentProps) {
  const { lang } = useLang()
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en)
  const [data, setData] = useState<CaseData | null>(null),
    [error, setError] = useState(""),
    [reload, setReload] = useState(0),
    [assessment, setAssessment] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [session, setSession] = useState<SessionRecord | null>(null),
    [loadingReport, setLoadingReport] = useState(false),
    [reportError, setReportError] = useState("")
  const [person, setPerson] = useState<{
    age?: number
    sex?: string
    language?: string
    group?: string
  }>({})
  const assigning = useRef(false),
    reportToken = useRef(0)
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setError("")
    pb.send<CaseData>(`/api/dsc/cases/${caseId}/assessments`, {
      method: "GET",
      signal: controller.signal,
    })
      .then((r) => {
        if (active) { setData(r); onCountChange?.(r.sessions.length) }
      })
      .catch((e) => {
        if (active) setError(getErrorMessage(e))
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [caseId, reload, onCountChange])
  useEffect(
    () => () => {
      // Invalidate in-flight report requests when this case panel unmounts.
      reportToken.current++
    },
    []
  )
  async function assign() {
    if (!assessment || assigning.current) return
    assigning.current = true
    setBusy(true)
    setNotice("")
    setError("")
    try {
      const s = await pb.send<SessionRecord>(
        "/api/dsc/assessment-sessions/assign",
        {
          method: "POST",
          body: { assessment, case: caseId, population: person },
        }
      )
      setData((d) =>
        d
          ? {
              ...d,
              sessions: [s, ...d.sessions.filter((item) => item.id !== s.id)],
            }
          : d
      )
      onAssigned?.()
      setNotice(
        t(
          "تم إرسال المقياس إلى حساب العميل داخل الموقع.",
          "Assessment assigned to the client's account in this website."
        )
      )
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      assigning.current = false
      setBusy(false)
    }
  }
  async function viewReport(id: string) {
    const token = ++reportToken.current
    setSession(null)
    setLoadingReport(true)
    setReportError("")
    try {
      const s = await pb.send<SessionRecord>(
        `/api/dsc/assessment-sessions/${id}`,
        { method: "GET" }
      )
      if (token === reportToken.current) setSession(s)
    } catch (e) {
      if (token === reportToken.current) setReportError(getErrorMessage(e))
    } finally {
      if (token === reportToken.current) setLoadingReport(false)
    }
  }
  function status(s: SessionRecord) {
    if (s.status === "completed") return t("مكتمل", "Completed")
    if (s.submitted_at)
      return t("مرسل ويحتاج مراجعة", "Submitted — review needed")
    return s.status === "assigned"
      ? t("بانتظار العميل", "Awaiting client")
      : t("بدأ العميل الإجابة", "Client draft")
  }
  return (
    <section
      className="space-y-4"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {mode === "all" && <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-primary">
            {t("المقاييس والتقييمات", "Assessments")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t(
              "أرسل مقياسًا منشورًا للعميل، ثم راجع إجابات وتقرير الإصدار نفسه.",
              "Assign a published assessment to the client, then review that version's answers and report."
            )}
          </p>
        </div>
        <Button variant="outline" onClick={() => setReload((v) => v + 1)}>
          {t("تحديث الحالة", "Refresh status")}
        </Button>
      </header>}
      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded bg-green-50 p-3 text-green-900">
          {notice}
        </p>
      )}
      {!data && !error && (
        <p role="status">{t("جارٍ تحميل المقاييس…", "Loading assessments…")}</p>
      )}
      {mode !== "list" && data?.canAssign && (
        <fieldset
          disabled={busy}
          className="space-y-3 border-s-4 border-primary bg-slate-50 p-4"
        >
          <legend className="sr-only">
            {t("إرسال تقييم", "Assign assessment")}
          </legend>
          {!data.assessments.length ? (
            <p>
              {t(
                "لا توجد مقاييس منشورة. احفظ المقياس واختبره ثم انشره أولًا.",
                "No published assessments are available. Save, test and publish an assessment first."
              )}
            </p>
          ) : (
            <>
              <label className="grid gap-1 text-sm font-medium">
                {t("المقياس والإصدار", "Assessment and version")}
                <select
                  className={selectStyle}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                >
                  <option value="">
                    {t("اختر مقياسًا منشورًا", "Choose a published assessment")}
                  </option>
                  {data.assessments.map((a) => (
                    <option value={a.id} key={a.id}>
                      {a.name} · {a.version}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="grid gap-1 text-sm">
                  {t("العمر (اختياري)", "Age (optional)")}
                  <Input
                    fieldWidth="short" type="number"
                    min="0"
                    max="150"
                    value={person.age ?? ""}
                    onChange={(e) =>
                      setPerson({
                        ...person,
                        age: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </label>
                {(["sex", "language", "group"] as const).map((k, i) => (
                  <label key={k} className="grid gap-1 text-sm">
                    {
                      [
                        t("الجنس (اختياري)", "Sex (optional)"),
                        t("اللغة (اختياري)", "Language (optional)"),
                        t("المجموعة (اختياري)", "Group (optional)"),
                      ][i]
                    }
                    <Input
                      value={person[k] ?? ""}
                      onChange={(e) =>
                        setPerson({ ...person, [k]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </div>
              <Button disabled={busy || !assessment} onClick={assign}>
                {busy
                  ? t("جارٍ الإرسال…", "Assigning…")
                  : t("إرسال للعميل", "Send to client")}
              </Button>
              <p className="text-xs text-slate-600">
                {t(
                  "يظهر في قائمة «تقييماتي» لدى مالك الحالة. لا يرسل بريدًا أو رسالة خارجية.",
                  "Appears in the case owner's My assessments list. No external email or message is sent."
                )}
              </p>
            </>
          )}
        </fieldset>
      )}
      {mode !== "assign" && (data || assignmentRows) &&
        (!data?.sessions.length && !assignmentRows ? (
          <p className="rounded border border-dashed p-4 text-slate-600">
            {t(
              "لا توجد تعيينات لهذه الحالة بعد.",
              "No assignments have been added to this case."
            )}
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr>
                  {[
                    t("التعيين", "Assignment"),
                    t("النوع", "Type"),
                    t("الحالة", "Status"),
                    t("مرئي للمستخدم", "Visible to user"),
                    t("تاريخ التعيين", "Assigned date"),
                    t("التقرير", "Report"),
                  ].map((h) => (
                    <th key={h} className="p-2 text-start">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignmentRows}
                {data?.sessions.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2 font-medium">{s.snapshot.name} · {s.snapshot.version}</td>
                    <td className="p-2">{t("مقياس / تقييم", "Assessment")}</td>
                    <td className="p-2">{status(s)}</td>
                    <td className="p-2">{s.recipient ? t("نعم", "Yes") : t("لا", "No")}</td>
                    <td className="p-2">{s.assigned_at || s.created}</td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        onClick={() => viewReport(s.id)}
                      >
                        {t("عرض الإجابات والتقرير", "View answers & report")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      {loadingReport && (
        <p role="status">{t("جارٍ تحميل التقرير…", "Loading report…")}</p>
      )}
      {reportError && (
        <p role="alert" className="text-red-700">
          {reportError}
        </p>
      )}
      {session && (
        <section className="case-assessment-report space-y-4 border-t pt-5">
          <header>
            <h3 className="text-xl font-bold">{session.snapshot.name}</h3>
            <p className="text-sm text-slate-600">
              {t("الحالة", "Case")}: {caseId} · {t("الإصدار", "Version")}:{" "}
              {session.snapshot.version} · {t("التطبيق", "Session")}:{" "}
              {session.id}
            </p>
            <p className="text-sm text-slate-600">
              {t("المنفذ", "Operator")}: {session.operator} ·{" "}
              {session.submitted_at || session.created} · {status(session)}
            </p>
          </header>
          {!session.result ? (
            <p className="rounded bg-slate-50 p-3">
              {t(
                "لم يُحسب تقرير نهائي بعد. يمكن للعميل متابعة الإجابات حتى يرسلها نهائيًا.",
                "No final report has been calculated yet. The client can resume answers until final submission."
              )}
            </p>
          ) : (
            <>
              <p className="rounded bg-slate-50 p-3">
                {t("المجاب", "Answered")}: {session.result.answered}/
                {session.result.total} · {t("الناقص", "Missing")}:{" "}
                {session.result.total - session.result.answered} ·{" "}
                {session.result.complete
                  ? t("مكتمل", "Complete")
                  : t("غير مكتمل", "Incomplete")}
              </p>
              {session.result.scores.map((s) => (
                <article key={s.id} className="rounded border p-4">
                  <div className="flex justify-between gap-3">
                    <h4 className="font-bold">{s.name}</h4>
                    <strong>
                      {s.value === null
                        ? s.notApplicable
                          ? t("غير منطبق", "Not applicable")
                          : t("بيانات غير كافية", "Insufficient data")
                        : Number(s.value.toFixed(3))}
                    </strong>
                  </div>
                  {s.value !== null && (
                    <div className="my-3 h-2 bg-slate-100">
                      <div
                        className="h-2 bg-primary"
                        style={{
                          width: `${Math.min(100, Math.max(0, s.max === s.min ? 0 : ((s.value - s.min) / (s.max - s.min)) * 100))}%`,
                        }}
                      />
                    </div>
                  )}
                  <p>{s.interpretation}</p>
                  <p className="text-sm text-slate-700">{s.recommendation}</p>
                </article>
              ))}
              {session.result.alerts.map((a, i) => (
                <aside
                  key={i}
                  className="rounded border border-amber-200 bg-amber-50 p-3"
                >
                  <strong>{a.message}</strong>
                  <p>{a.recommendation}</p>
                </aside>
              ))}
            </>
          )}
          <details className="space-y-2">
            <summary className="font-bold">
              {t("إجابات العميل", "Client answers")}
            </summary>
            <ol className="divide-y">
              {session.snapshot.questions
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((q) => (
                  <li key={q.id} className="py-2">
                    <strong>
                      {q.order}. {q.text}
                    </strong>
                    <p>
                      {session.snapshot.answerSets
                        .find((s) => s.id === q.answerSet)
                        ?.options.find((o) => o.id === session.answers[q.id])
                        ?.label ?? t("لم يُجب", "Not answered")}
                    </p>
                  </li>
                ))}
            </ol>
          </details>
          <Button
            className="print:hidden"
            variant="outline"
            onClick={() => window.print()}
          >
            {t("طباعة التقرير / PDF", "Print report / PDF")}
          </Button>
        </section>
      )}
      {session && (
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .case-assessment-report,
            .case-assessment-report * {
              visibility: visible;
            }
            .case-assessment-report {
              position: absolute;
              inset: 0;
              padding: 20px;
              background: white;
            }
            .case-assessment-report article {
              break-inside: avoid;
            }
          }
        `}</style>
      )}
    </section>
  )
}
