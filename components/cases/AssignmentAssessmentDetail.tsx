"use client"
import { useEffect, useState } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import type { SessionRecord } from "@/lib/assessments/types"
import { Button } from "@/components/ui/button"

export function AssignmentAssessmentDetail({ id, ar }: { id: string; ar: boolean }) {
  const [reload, setReload] = useState(0)
  const [data, setData] = useState<{ id: string; ar: boolean; reload: number; session?: SessionRecord; error?: string } | null>(null)
  const current = data?.id === id && data.ar === ar && data.reload === reload ? data : null
  const session = current?.session
  const error = current?.error
  useEffect(() => {
    const controller = new AbortController()
    pb.send<SessionRecord>(`/api/dsc/assessment-sessions/${encodeURIComponent(id)}`, { method: "GET", signal: controller.signal, requestKey: null }).then(session => { if (!controller.signal.aborted) setData({ id, ar, reload, session }) }).catch(e => { if (!controller.signal.aborted) setData({ id, ar, reload, error: getErrorMessage(e, ar ? "ar" : "en") }) })
    return () => controller.abort()
  }, [id, ar, reload])
  if (error) return <div className="space-y-3"><p role="alert" className="text-red-700">{error}</p><Button variant="outline" onClick={() => setReload(value => value + 1)}>{ar ? "إعادة المحاولة" : "Retry"}</Button></div>
  if (!session) return <p role="status">{ar ? "جارٍ تحميل الأداة والإجابات…" : "Loading tool and responses…"}</p>
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-[#075bb6]">{ar ? "عناصر المقياس" : "Assessment items"} ({session.snapshot.questions.length})</h3><span className="text-xs text-slate-600">{ar ? "عرض إجابات صاحب الحالة · للقراءة فقط" : "Case owner's responses · read only"}</span></div>
    {session.snapshot.instructions && <p className="rounded-xl bg-blue-50/60 p-4 text-sm leading-7" dir="auto">{session.snapshot.instructions}</p>}
    <div className="max-h-[480px] space-y-2 overflow-y-auto pe-1">{session.snapshot.questions.map((question, i) => <fieldset key={question.id} className="rounded-xl border border-blue-50 bg-[#f4f8ff] p-4"><legend className="sr-only">{question.text}</legend><div className="mb-3 flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-bold text-blue-700">{i + 1}</span><p className="text-sm font-semibold leading-7" dir="auto">{question.text}</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 ps-10">{session.snapshot.answerSets.find(set => set.id === question.answerSet)?.options.map(option => <label key={option.id} className="inline-flex items-center gap-2 text-xs text-[#294d6c]"><input type="radio" name={`${id}-${question.id}`} checked={session.answers[question.id] === option.id} readOnly disabled className="size-4 accent-blue-600 disabled:opacity-100" />{option.label}</label>)}</div></fieldset>)}</div>
    {session.result && <section className="space-y-3 border-t border-blue-100 pt-4"><h3 className="font-bold">{ar ? "ملخص النتائج" : "Result summary"}</h3>{session.result.scores.map(score => <article key={score.id} className="rounded-xl bg-blue-50 p-4"><div className="flex justify-between gap-3 font-bold"><span>{score.name}</span><span>{score.value === null ? "—" : Number(score.value.toFixed(3))}</span></div><p className="mt-2 text-sm leading-7">{score.interpretation}</p><p className="text-sm leading-7">{score.recommendation}</p></article>)}</section>}
  </div>
}
