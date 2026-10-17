"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import pb, { getErrorMessage } from "@/lib/pb"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
import type { Answers, ClientAssessment } from "@/lib/assessments/types"

export function assessmentStatus(
  status: ClientAssessment["status"],
  submitted: boolean,
  ar: boolean
) {
  if (submitted) return ar ? "تم الإرسال" : "Submitted"
  return {
    assigned: ar ? "بانتظار إجابتك" : "Awaiting your answers",
    in_progress: ar ? "مسودة محفوظة" : "Saved draft",
    incomplete: ar ? "غير مكتمل" : "Incomplete",
    completed: ar ? "مكتمل" : "Completed",
  }[status]
}
export function ClientAssessmentList({ caseId }: { caseId?: string }) {
  const { lang } = useLang()
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en)
  const [sessions, setSessions] = useState<ClientAssessment[] | null>(null),
    [error, setError] = useState(""),
    [reload, setReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    queueMicrotask(() => {
      if (current) {
        setSessions(null)
        setError("")
      }
    })
    pb.send<{ sessions: ClientAssessment[] }>("/api/dsc/my-assessments", {
      method: "GET",
      signal: controller.signal,
    })
      .then((r) => {
        if (current)
          setSessions(r.sessions.filter((s) => !caseId || s.case === caseId))
      })
      .catch((e) => {
        if (current) setError(getErrorMessage(e))
      })
    return () => {
      current = false
      controller.abort()
    }
  }, [caseId, reload])
  return (
    <section className="space-y-4 rounded-lg border bg-white p-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-primary">
          {t("تقييماتي", "My assessments")}
        </h2>
        <Button variant="outline" onClick={() => setReload((v) => v + 1)}>
          {t("تحديث", "Refresh")}
        </Button>
      </header>
      <p className="text-sm text-slate-600">
        {t(
          "المقاييس التي أرسلها إليك المختص. يمكنك حفظ الإجابات والعودة إليها قبل الإرسال النهائي.",
          "Assessments assigned by your practitioner. Save your answers and return before final submission."
        )}
      </p>
      {error ? (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      ) : sessions === null ? (
        <p role="status">
          {t("جارٍ تحميل التقييمات…", "Loading assessments…")}
        </p>
      ) : !sessions.length ? (
        <p className="rounded bg-slate-50 p-4">
          {t(
            "لا توجد تقييمات مرسلة إليك حاليًا.",
            "You have no assigned assessments yet."
          )}
        </p>
      ) : (
        <ul className="divide-y">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <h3 className="font-bold">{s.name}</h3>
                <p className="text-sm text-slate-600">
                  {s.caseName} · {t("الإصدار", "Version")} {s.version} ·{" "}
                  {assessmentStatus(s.status, !!s.submitted_at, lang === "ar")}
                </p>
              </div>
              <Link
                href={`/dashboard/assessments/${s.id}`}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                {s.submitted_at
                  ? t("عرض الإجابات المرسلة", "View submitted answers")
                  : t("فتح التقييم", "Open assessment")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
export default function ClientAssessments({
  sessionId,
}: {
  sessionId: string
}) {
  const { lang } = useLang()
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en)
  const [session, setSession] = useState<ClientAssessment | null>(null),
    [answers, setAnswers] = useState<Answers>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [reload, setReload] = useState(0),
    [dirty, setDirty] = useState(false)
  const submitting = useRef(false),
    generation = useRef(0)
  const load = useCallback(() => {
    setReload((v) => v + 1)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    const token = ++generation.current
    setSession(null)
    setBusy(false)
    setAnswers({})
    setError("")
    setNotice("")
    setDirty(false)
    pb.send<ClientAssessment>(`/api/dsc/my-assessments/${sessionId}`, {
      method: "GET",
      signal: controller.signal,
    })
      .then((s) => {
        if (generation.current === token) {
          setSession(s)
          setAnswers(s.answers ?? {})
        }
      })
      .catch((e) => {
        if (generation.current === token) setError(getErrorMessage(e))
      })
    return () => {
      // Request generation counters must advance on cleanup; this is not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++
      controller.abort()
    }
  }, [sessionId, reload])
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
  const answered = session?.questions.filter((q) => !!answers[q.id]).length ?? 0
  const locked = !!session?.submitted_at
  async function submit(finalize: boolean) {
    if (!session || submitting.current || locked) return
    if (
      finalize &&
      (answered < session.minAnswered ||
        (session.requireAll && answered < session.questions.length))
    ) {
      setError(
        t(
          "أكمل الإجابات المطلوبة قبل الإرسال النهائي.",
          "Complete the required answers before final submission."
        )
      )
      return
    }
    if (
      finalize &&
      !window.confirm(
        t(
          "إرسال الإجابات نهائيًا؟ لن تتمكن من تعديلها بعد الإرسال.",
          "Submit your answers? You cannot edit them after submission."
        )
      )
    )
      return
    submitting.current = true
    setBusy(true)
    setError("")
    setNotice("")
    const token = generation.current
    try {
      const s = await pb.send<ClientAssessment>(
        `/api/dsc/my-assessments/${session.id}/submit`,
        { method: "POST", body: { answers, finalize } }
      )
      if (token !== generation.current) return
      setSession(s)
      setAnswers(s.answers ?? {})
      setDirty(false)
      setNotice(
        finalize
          ? t(
              "تم إرسال إجاباتك إلى المختص بنجاح.",
              "Your answers have been submitted to your practitioner."
            )
          : t(
              "تم حفظ المسودة. يمكنك العودة لإكمالها.",
              "Draft saved. You can return to finish it."
            )
      )
    } catch (e) {
      if (token === generation.current) setError(getErrorMessage(e))
    } finally {
      submitting.current = false
      if (token === generation.current) setBusy(false)
    }
  }
  return (
    <main
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="mx-auto max-w-3xl space-y-5 p-4 md:p-7"
    >
      <Link className="text-sm text-primary" href="/dashboard/assessments">
        {t("← تقييماتي", "← My assessments")}
      </Link>
      {!session ? (
        <section className="rounded-lg border bg-white p-6">
          {error ? (
            <>
              <p role="alert" className="mb-3 text-red-700">
                {error}
              </p>
              <Button onClick={load}>{t("إعادة المحاولة", "Retry")}</Button>
            </>
          ) : (
            <p role="status">
              {t("جارٍ تحميل التقييم…", "Loading assessment…")}
            </p>
          )}
        </section>
      ) : (
        <>
          <header className="border-b pb-5">
            <p className="text-sm text-slate-600">
              {session.caseName} · {t("الإصدار", "Version")} {session.version}
            </p>
            <h1 className="my-2 text-3xl font-bold text-primary">
              {session.name}
            </h1>
            <p className="whitespace-pre-wrap text-slate-700">
              {session.instructions}
            </p>
          </header>
          {locked ? (
            <p
              role="status"
              className="rounded border border-green-200 bg-green-50 p-4 text-green-900"
            >
              {t(
                "تم إرسال هذا التقييم. الإجابات متاحة للقراءة، وسيقوم المختص بمراجعتها.",
                "This assessment has been submitted. Your answers are read-only and will be reviewed by your practitioner."
              )}
            </p>
          ) : (
            <div className="rounded border bg-white p-4">
              <div className="flex justify-between gap-3 text-sm">
                <span>{t("الأسئلة المجابة", "Answered questions")}</span>
                <span>
                  {answered}/{session.questions.length}
                </span>
              </div>
              <progress
                aria-label={t("تقدم الإجابة", "Answer progress")}
                className="mt-2 h-2 w-full accent-primary"
                max={Math.max(1, session.questions.length)}
                value={answered}
              />
              <p className="mt-2 text-sm text-slate-600">
                {session.requireAll
                  ? t(
                      "يجب الإجابة عن جميع الأسئلة.",
                      "All questions require an answer."
                    )
                  : t(
                      `الحد الأدنى للإرسال: ${session.minAnswered} إجابة.`,
                      `Minimum required: ${session.minAnswered} answers.`
                    )}
              </p>
            </div>
          )}
          {error && (
            <p
              role="alert"
              className="rounded border border-red-200 bg-red-50 p-3 text-red-800"
            >
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded bg-green-50 p-3 text-green-900">
              {notice}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submit(true)
            }}
            className="space-y-4"
          >
            {session.questions
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((q) => (
                <fieldset
                  disabled={busy || locked}
                  key={q.id}
                  className="rounded-lg border bg-white p-5"
                >
                  <legend className="px-2 font-bold">
                    {q.order}. {q.text}
                  </legend>
                  <div className="grid gap-2">
                    {q.options.map((o) => (
                      <label
                        key={o.id}
                        className={`flex min-h-11 cursor-pointer items-start gap-3 rounded border p-3 ${answers[q.id] === o.id ? "border-primary bg-sky-50" : "border-slate-200"}`}
                      >
                        <input
                          type="radio"
                          className="mt-1 accent-primary"
                          name={`question-${q.id}`}
                          value={o.id}
                          checked={answers[q.id] === o.id}
                          onChange={() => {
                            setAnswers((a) => ({ ...a, [q.id]: o.id }))
                            setDirty(true)
                            setNotice("")
                            setError("")
                          }}
                        />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>
                  {answers[q.id] && !locked && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-slate-600 underline"
                      onClick={() => {
                        setAnswers((a) => {
                          const next = { ...a }
                          delete next[q.id]
                          return next
                        })
                        setDirty(true)
                      }}
                    >
                      {t("مسح الإجابة", "Clear answer")}
                    </button>
                  )}
                </fieldset>
              ))}
            {!locked && (
              <footer className="flex flex-wrap gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => submit(false)}
                >
                  {busy
                    ? t("جارٍ الحفظ…", "Saving…")
                    : t("حفظ المسودة", "Save draft")}
                </Button>
                <Button disabled={busy} type="submit">
                  {t("إرسال الإجابات نهائيًا", "Submit final answers")}
                </Button>
                <p className="w-full text-sm text-slate-600">
                  {t(
                    "الإرسال من داخل الموقع فقط. لا تُرسل رسائل خارجية.",
                    "Delivery takes place within this website."
                  )}
                </p>
              </footer>
            )}
          </form>
        </>
      )}
    </main>
  )
}
