"use client"
import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import AnswerMatrix from "./AnswerMatrix"
import AssessmentInstructions from "./AssessmentInstructions"
import { previewQuestions } from "./import-questions"
import pb, { getErrorMessage } from "@/lib/pb"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type {
  Definition,
  Rule,
  AssessmentRecord,
  SessionRecord,
  Answers,
  Result,
  Population,
} from "@/lib/assessments/types"

const id = () => "a" + crypto.randomUUID().replaceAll("-", "").slice(0, 14)
const fresh = (): Definition => ({
  name: "",
  code: "",
  description: "",
  audience: "",
  language: "ar",
  duration: 15,
  version: "1.0",
  instructions: "",
  type: "scale",
  missingPolicy: "reject",
  minAnswered: 1,
  direction: "higher_problem",
  dimensions: [],
  answerSets: [],
  questions: [],
  totalRule: { method: "sum" },
  indicators: [],
  bands: [],
  alerts: [],
})
const methods: Rule["method"][] = [
  "sum",
  "mean",
  "percentage",
  "weighted_mean",
  "count",
  "formula",
  "standard",
]
const selectClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 disabled:bg-slate-100"
function displayLabel(key: string, t: (a: string, b: string) => string) {
  const labels: Record<string, [string, string]> = {
    text: ["نص السؤال", "Question text"],
    order: ["الترتيب", "Order"],
    dimensions: ["الأبعاد", "Dimensions"],
    weight: ["الوزن", "Weight"],
    reverse: ["عكس الدرجة", "Reverse score"],
    critical: ["سؤال حرج", "Critical question"],
    answerSet: ["مجموعة الإجابة", "Answer set"],
    sex: ["الجنس", "Sex"],
    language: ["اللغة", "Language"],
    group: ["المجموعة", "Group"],
    min: ["الحد الأدنى", "Minimum"],
    max: ["الحد الأعلى", "Maximum"],
    score: ["الدرجة المعيارية", "Standard score"],
    gt: ["أكبر من", "Greater than"],
    gte: ["أكبر من أو يساوي", "Greater than or equal"],
    lt: ["أقل من", "Less than"],
    lte: ["أقل من أو يساوي", "Less than or equal"],
    eq: ["يساوي", "Equal"],
  }
  return labels[key] ? t(...labels[key]) : key
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}
function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
function Num({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <Input
      fieldWidth="short" type="number"
      step="any"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}
function PopulationFields({
  value,
  onChange,
  t,
}: {
  value: Population
  onChange: (v: Population) => void
  t: (a: string, b: string) => string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      <Field label={t("أقل عمر", "Minimum age")}>
        <Input
          fieldWidth="short" type="number"
          value={value.minAge ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              minAge: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </Field>
      <Field label={t("أعلى عمر", "Maximum age")}>
        <Input
          fieldWidth="short" type="number"
          value={value.maxAge ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              maxAge: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </Field>
      {(["sex", "language", "group"] as const).map((k, i) => (
        <Field
          key={k}
          label={
            [t("الجنس", "Sex"), t("اللغة", "Language"), t("المجموعة", "Group")][
              i
            ]
          }
        >
          <Input
            value={value[k] ?? ""}
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
          />
        </Field>
      ))}
    </div>
  )
}
function RuleEditor({
  value,
  onChange,
  t,
}: {
  value: Rule
  onChange: (r: Rule) => void
  t: (a: string, b: string) => string
}) {
  return (
    <div className="space-y-3 rounded-md bg-slate-50 p-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t("طريقة الحساب", "Scoring method")}>
          <Select
            value={value.method}
            onChange={(v) =>
              onChange({
                ...value,
                method: v as Rule["method"],
                ...(v !== "formula"
                  ? {
                      zeroDenominator: undefined,
                      notApplicableLabel: undefined,
                    }
                  : {}),
                ...(v === "count"
                  ? {
                      operator: value.operator ?? "gte",
                      threshold: value.threshold ?? 0,
                    }
                  : {}),
              })
            }
            options={methods.map((v, i) => ({
              value: v,
              label: [
                t("المجموع", "Sum"),
                t("المتوسط", "Mean"),
                t("النسبة المئوية", "Percentage"),
                t("المتوسط المرجح", "Weighted mean"),
                t("العد", "Count"),
                t("المعادلة", "Formula"),
                t("الدرجة المعيارية", "Standard score"),
              ][i],
            }))}
          />
        </Field>
        <Field label={t("أقل عدد مجاب", "Minimum answered")}>
          <Num
            value={value.minAnswered ?? 0}
            onChange={(v) => onChange({ ...value, minAnswered: v })}
          />
        </Field>
      </div>
      {value.method === "formula" && (
        <div className="space-y-3">
          <Field label={t("المعادلة الآمنة", "Safe formula")}>
            <Input
              dir="ltr"
              placeholder="SUM / ANSWERED"
              value={value.formula ?? ""}
              onChange={(e) => onChange({ ...value, formula: e.target.value })}
            />
            <small dir="ltr" className="text-xs font-normal text-slate-600">
              SUM, MEAN, COUNT, ANSWERED, TOTAL, WEIGHTED_SUM, WEIGHT_SUM, MIN,
              MAX, POSITIVE_COUNT; min(), max(), abs(), round(), sqrt().
            </small>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.zeroDenominator === "not_applicable"}
              onChange={(e) =>
                onChange({
                  ...value,
                  zeroDenominator: e.target.checked
                    ? "not_applicable"
                    : undefined,
                  notApplicableLabel:
                    value.notApplicableLabel ||
                    t("غير قابل للحساب", "Not applicable"),
                })
              }
            />
            {t(
              "عند القسمة على صفر: عرض نتيجة غير قابلة للحساب دون اعتبار الإجابات ناقصة",
              "On division by zero: show not applicable without treating responses as incomplete"
            )}
          </label>
          {value.zeroDenominator === "not_applicable" && (
            <Field
              label={t(
                "رسالة النتيجة غير القابلة للحساب",
                "Not-applicable message"
              )}
            >
              <Input
                value={value.notApplicableLabel ?? ""}
                maxLength={500}
                onChange={(e) =>
                  onChange({ ...value, notApplicableLabel: e.target.value })
                }
              />
            </Field>
          )}
        </div>
      )}
      {value.method === "count" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            value={value.operator ?? "gte"}
            onChange={(v) =>
              onChange({ ...value, operator: v as Rule["operator"] })
            }
            options={["gt", "gte", "lt", "lte", "eq"].map((v) => ({
              value: v,
              label: displayLabel(v, t),
            }))}
          />
          <Num
            value={value.threshold ?? 0}
            onChange={(v) => onChange({ ...value, threshold: v })}
          />
        </div>
      )}
      {value.method === "standard" && (
        <div className="space-y-3">
          {(value.normTable ?? []).map((row, i) => (
            <fieldset key={i} className="space-y-3 border p-3">
              <legend>
                {t("صف معياري", "Norm row")} {i + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["min", "max", "score"] as const).map((k) => (
                  <Field key={k} label={displayLabel(k, t)}>
                    <Num
                      value={row[k]}
                      onChange={(v) =>
                        onChange({
                          ...value,
                          normTable: value.normTable!.map((r, j) =>
                            i === j ? { ...r, [k]: v } : r
                          ),
                        })
                      }
                    />
                  </Field>
                ))}
              </div>
              <PopulationFields
                value={row.population ?? {}}
                onChange={(p) =>
                  onChange({
                    ...value,
                    normTable: value.normTable!.map((r, j) =>
                      i === j ? { ...r, population: p } : r
                    ),
                  })
                }
                t={t}
              />
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    normTable: value.normTable!.filter((_, j) => j !== i),
                  })
                }
              >
                {t("حذف الصف", "Remove row")}
              </Button>
            </fieldset>
          ))}
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              onChange({
                ...value,
                normTable: [
                  ...(value.normTable ?? []),
                  { min: 0, max: 0, score: 0 },
                ],
              })
            }
          >
            {t("إضافة صف معياري", "Add norm row")}
          </Button>
        </div>
      )}
    </div>
  )
}
function Results({
  result,
  t,
  questions,
}: {
  result: Result
  t: (a: string, b: string) => string
  questions: Definition["questions"]
}) {
  return (
    <section className="space-y-5" aria-live="polite">
      <div className="border-s-4 border-amber-500 bg-amber-50 p-4">
        <strong>
          {result.complete
            ? t("مكتمل", "Complete")
            : t("غير مكتمل", "Incomplete")}
        </strong>
        <p>
          {t("المجاب", "Answered")}: {result.answered}/{result.total} ·{" "}
          {t("غير المجاب", "Missing")}: {result.total - result.answered} ·{" "}
          {t("الإصدار", "Version")}: {result.version}
        </p>
      </div>
      {result.scores.map((s) => (
        <article key={s.id} className="rounded-md border p-4">
          <div className="flex justify-between gap-3">
            <strong>{s.name}</strong>
            <strong>
              {s.value === null
                ? s.notApplicable
                  ? s.interpretation
                  : t("بيانات غير كافية", "Insufficient data")
                : Number(s.value.toFixed(3))}
            </strong>
          </div>
          {s.value !== null && (
            <div className="my-3 h-2 bg-slate-100">
              <div
                className="h-2 bg-[#0b4263]"
                style={{
                  width: `${Math.min(100, Math.max(0, s.max === s.min ? 0 : ((s.value - s.min) / (s.max - s.min)) * 100))}%`,
                }}
              />
            </div>
          )}
          <p>{s.interpretation}</p>
          <p className="text-sm text-slate-600">{s.recommendation}</p>
          <details>
            <summary>{t("تفاصيل الحساب", "Calculation details")}</summary>
            <p dir="ltr">
              sum: {s.sum} · weightedSum: {s.weightedSum} · weightSum:{" "}
              {s.weightSum} · answered: {s.answered}/{s.total}
            </p>
          </details>
        </article>
      ))}
      {result.alerts.map((a, i) => (
        <aside key={i} className="border border-amber-300 bg-amber-50 p-3">
          <strong>{a.message}</strong>
          <p>{a.recommendation}</p>
        </aside>
      ))}
      <details>
        <summary>
          {t("خطوات حساب كل سؤال", "Per-question scoring steps")}
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {[
                  t("السؤال", "Question"),
                  t("الخام", "Raw"),
                  t("بعد العكس", "Adjusted"),
                  t("الوزن", "Weight"),
                  t("مستبعد", "Omitted"),
                ].map((h) => (
                  <th key={h} className="p-2 text-start">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.steps.map((s, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">
                    {questions.find((q) => q.id === s.question)?.text ??
                      s.question}
                  </td>
                  <td>{s.raw ?? "—"}</td>
                  <td>{s.adjusted ?? "—"}</td>
                  <td>{s.weight}</td>
                  <td>{s.omitted ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}

export default function AssessmentBuilder() {
  const { lang } = useLang()
  const t = (a: string, b: string) => (lang === "ar" ? a : b)
  const [data, setData] = useState<{
    assessments: AssessmentRecord[]
    sessions: SessionRecord[]
    cases: { id: string; name: string }[]
    canManage: boolean
    canCreate: boolean
  } | null>(null)
  const [record, setRecord] = useState<AssessmentRecord | null>(null),
    [definition, setDefinition] = useState<Definition>(fresh),
    [tab, setTab] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [dirty, setDirty] = useState(false)
  const [answers, setAnswers] = useState<Answers>({}),
    [population, setPopulation] = useState<Population & { age?: number }>({}),
    [result, setResult] = useState<Result | null>(null),
    [session, setSession] = useState<SessionRecord | null>(null),
    [caseId, setCaseId] = useState(""),
    [version, setVersion] = useState("")
  const [sheets, setSheets] = useState<
      Record<string, Record<string, unknown>[]>
    >({}),
    [sheet, setSheet] = useState(""),
    [mapping, setMapping] = useState<Record<string, string>>({}),
    [importPreview, setImportPreview] = useState<Definition["questions"]>([])
  async function run<T>(work: () => Promise<T>): Promise<T | undefined> {
    setBusy(true)
    setError("")
    try {
      return await work()
    } catch (e) {
      const m = getErrorMessage(e)
      setError(m)
      toast.error(m)
    } finally {
      setBusy(false)
    }
  }
  async function load() {
    await run(async () => {
      const response = await pb.send<NonNullable<typeof data>>(
        "/api/dsc/assessments",
        { method: "GET" }
      )
      setData(response)
      if (!response.canManage) setTab(7)
    })
  }
  useEffect(() => {
    void load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  function change(next: Definition) {
    setDefinition(next)
    setImportPreview([])
    setDirty(true)
    setResult(null)
  }
  async function open(a: AssessmentRecord) {
    if (
      dirty &&
      !window.confirm(
        t("تجاهل التعديلات غير المحفوظة؟", "Discard unsaved changes?")
      )
    )
      return
    await run(async () => {
      const r = await pb.send<AssessmentRecord>(
        `/api/dsc/assessments/${a.id}`,
        { method: "GET" }
      )
      setRecord(r)
      setDefinition(r.definition)
      setImportPreview([])
      setDirty(false)
      setAnswers({})
      setResult(null)
      setSession(null)
    })
  }
  async function save() {
    return run(async () => {
      const r = await pb.send<AssessmentRecord>("/api/dsc/assessments/save", {
        method: "POST",
        body: { id: record?.id, definition },
      })
      setRecord(r)
      setDefinition(r.definition)
      setDirty(false)
      setData((d) =>
        d
          ? {
              ...d,
              assessments: [...d.assessments.filter((a) => a.id !== r.id), r],
            }
          : d
      )
      toast.success(t("حُفظت المسودة", "Draft saved"))
      return r
    })
  }
  const immutable = (!!record && record.status !== "draft") || !data?.canManage
  const targets = [
    { value: "overall", label: t("الدرجة الكلية", "Total score") },
    ...definition.dimensions.map((d) => ({ value: d.id, label: d.name })),
    ...definition.indicators.map((d) => ({ value: d.id, label: d.name })),
  ]
  function exportResult(format: "json" | "csv") {
    if (!result) return
    const csv =
      "\uFEFF" +
      [
        "name,value,interpretation,recommendation",
        ...result.scores.map((s) =>
          [s.name, s.value, s.interpretation, s.recommendation]
            .map((v) => '"' + String(v ?? "").replaceAll('"', '""') + '"')
            .join(",")
        ),
      ].join("\r\n")
    const blob = new Blob(
      [
        format === "json"
          ? JSON.stringify(
              {
                assessment: session?.assessment ?? record?.id,
                session: session?.id,
                definition: session?.snapshot ?? definition,
                population,
                result,
              },
              null,
              2
            )
          : csv,
      ],
      {
        type: format === "json" ? "application/json" : "text/csv;charset=utf-8",
      }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `assessment-report.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }
  const tabs = [
    t("البيانات الأساسية", "Basics"),
    t("الأبعاد", "Dimensions"),
    t("بدائل الإجابة", "Answer sets"),
    t("الأسئلة والاستيراد", "Questions & import"),
    t("الحساب والمؤشرات", "Scoring & indicators"),
    t("التفسير والتنبيهات", "Interpretation & alerts"),
    t("التجربة والنشر", "Test & publish"),
    t("التطبيق والتقرير", "Sessions & report"),
  ]
  if (!data)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          {t("بناء المقاييس والتقييمات", "Assessment builder")}
        </h1>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <Button onClick={load}>{t("إعادة المحاولة", "Retry")}</Button>
          </>
        ) : (
          <p role="status">
            {t("جارٍ تحميل المقاييس…", "Loading assessments…")}
          </p>
        )}
      </div>
    )
  return (
    <main
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="mx-auto max-w-7xl space-y-6 p-4 md:p-7"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/tools"
            className="text-sm text-slate-600"
          >
            {t("الأدوات ←", "← Tools")}
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-[#0b4263]">
            {t("بناء المقاييس والتقييمات", "Assessment builder")}
          </h1>
          <p className="mt-2 text-slate-600">
            {t(
              "تعريف المقياس، مراجعة حساباته، ثم تطبيق إصدار ثابت على الحالة.",
              "Define a scale, review its scoring, then apply a fixed version to a case."
            )}
          </p>
        </div>
        {data.canCreate && (
          <Button
            disabled={busy}
            onClick={() => {
              if (dirty && !confirm(t("تجاهل التعديلات؟", "Discard changes?")))
                return
              setRecord(null)
              setDefinition(fresh())
              setImportPreview([])
              setDirty(false)
              setSession(null)
              setResult(null)
              setTab(0)
            }}
          >
            {t("مقياس جديد", "New assessment")}
          </Button>
        )}
      </header>
      {error && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-red-800"
        >
          {error}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-[230px_1fr]">
        <aside className="space-y-3 print:hidden">
          <h2 className="font-bold">
            {t("المقاييس", "Assessments")} ({data.assessments.length})
          </h2>
          {!data.assessments.length && (
            <p className="text-sm text-slate-600">
              {t(
                "لا توجد مقاييس بعد. أنشئ مسودة للبدء.",
                "No assessments yet. Create a draft to begin."
              )}
            </p>
          )}
          {data.assessments.map((a) => (
            <button
              disabled={busy}
              key={a.id}
              onClick={() => open(a)}
              className={`block w-full border p-3 text-start ${(tab === 7 && session ? session.assessment : record?.id) === a.id ? "border-[#0b4263] bg-sky-50" : "bg-white"}`}
            >
              <strong className="block">{a.name}</strong>
              <small>
                {a.version} ·{" "}
                {a.status === "published"
                  ? t("منشور", "Published")
                  : a.status === "draft"
                    ? t("مسودة", "Draft")
                    : t("مؤرشف", "Archived")}
              </small>
            </button>
          ))}
        </aside>
        <section className="min-w-0 space-y-5 rounded-lg border bg-white p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              {(tab === 7 && session
                ? session.snapshot.name
                : definition.name) || t("مسودة جديدة", "New draft")}{" "}
              <span className="text-sm font-normal text-slate-500">
                {tab === 7 && session
                  ? session.snapshot.version
                  : record?.version}{" "}
                {dirty && t("· غير محفوظ", "· Unsaved")}
              </span>
            </h2>
            {data.canManage && !immutable && tab !== 7 && (
              <Button disabled={busy || (!dirty && !!record)} onClick={save}>
                {busy
                  ? t("جارٍ التنفيذ…", "Working…")
                  : t("حفظ المسودة", "Save draft")}
              </Button>
            )}
          </div>
          {data.canManage && tab !== 7 && (
            <div className="flex flex-wrap gap-4 border-s-4 border-[#0b4263] bg-slate-50 p-3 text-sm">
              <span>
                {t("الحفظ", "Saved")}: {record && !dirty ? "✓" : "—"}
              </span>
              <span>
                {t("اختبار الإصدار", "Version tested")}:{" "}
                {record?.tested && !dirty ? "✓" : "—"}
              </span>
              <span>
                {t("النشر", "Published")}:{" "}
                {record?.status === "published" ? "✓" : "—"}
              </span>
              <span>
                {t("الأسئلة", "Questions")}: {definition.questions.length}
              </span>
            </div>
          )}
          <nav
            aria-label={t("مراحل بناء المقياس", "Builder sections")}
            className="flex flex-wrap gap-1 border-b pb-3 print:hidden"
          >
            {tabs.map(
              (label, i) =>
                (data.canManage || i === 7) && (
                  <button
                    key={i}
                    aria-current={tab === i ? "step" : undefined}
                    onClick={() => {
                      setTab(i)
                      if ((i === 6 && session) || (i === 7 && tab !== 7)) {
                        setSession(null)
                        setAnswers({})
                        setResult(null)
                      }
                    }}
                    className={`rounded px-3 py-2 text-sm ${tab === i ? "bg-[#0b4263] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    {i + 1}. {label}
                  </button>
                )
            )}
          </nav>
          {tab === 0 && (
            <fieldset disabled={immutable || busy} className="space-y-4">
              <legend className="sr-only">{tabs[0]}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    "name",
                    "code",
                    "version",
                    "audience",
                    "type",
                    "language",
                  ] as const
                ).map((key, i) => (
                  <Field
                    key={key}
                    label={
                      [
                        t("اسم المقياس", "Assessment name"),
                        t("الرمز", "Code"),
                        t("الإصدار", "Version"),
                        t("الفئة المستهدفة", "Audience"),
                        t("النوع", "Type"),
                        t("اللغة", "Language"),
                      ][i]
                    }
                  >
                    <Input
                      value={definition[key]}
                      onChange={(e) =>
                        change({ ...definition, [key]: e.target.value })
                      }
                    />
                  </Field>
                ))}
                <Field label={t("المدة بالدقائق", "Duration in minutes")}>
                  <Num
                    value={definition.duration}
                    onChange={(duration) => change({ ...definition, duration })}
                  />
                </Field>
                <Field label={t("الحد الأدنى للمجاب", "Minimum answered")}>
                  <Num
                    value={definition.minAnswered}
                    onChange={(minAnswered) =>
                      change({ ...definition, minAnswered })
                    }
                  />
                </Field>
                <Field
                  label={t("سياسة الإجابات الناقصة", "Missing-answer policy")}
                >
                  <Select
                    value={definition.missingPolicy}
                    onChange={(v) =>
                      change({
                        ...definition,
                        missingPolicy: v as Definition["missingPolicy"],
                      })
                    }
                    options={[
                      {
                        value: "reject",
                        label: t("رفض النقص", "Reject missing"),
                      },
                      {
                        value: "omit",
                        label: t("استبعاد الناقص", "Omit missing"),
                      },
                      {
                        value: "zero",
                        label: t("احتساب صفر", "Score as zero"),
                      },
                    ]}
                  />
                </Field>
                <Field label={t("اتجاه الدرجة", "Score direction")}>
                  <Select
                    value={definition.direction}
                    onChange={(v) =>
                      change({
                        ...definition,
                        direction: v as Definition["direction"],
                      })
                    }
                    options={[
                      {
                        value: "higher_problem",
                        label: t(
                          "الأعلى يشير لمشكلة أكبر",
                          "Higher means more difficulty"
                        ),
                      },
                      {
                        value: "higher_better",
                        label: t("الأعلى أفضل", "Higher is better"),
                      },
                      {
                        value: "middle",
                        label: t("الوسط هو المستهدف", "Middle is preferred"),
                      },
                    ]}
                  />
                </Field>
              </div>
              {(
                [
                  "description",
                  "instructions",
                  "referencePeriod",
                  "respondentNotice",
                ] as const
              ).map((k) => (
                <Field
                  key={k}
                  label={
                    k === "description"
                      ? t("الوصف", "Description")
                      : k === "instructions"
                        ? t(
                            "المقدمة والتعليمات",
                            "Introduction and instructions"
                          )
                        : k === "referencePeriod"
                          ? t("الفترة الزمنية المرجعية", "Reference period")
                          : t("تنبيه للمجيب", "Notice to respondent")
                  }
                >
                  <textarea
                    className="min-h-24 rounded border p-3"
                    maxLength={12000}
                    value={definition[k] ?? ""}
                    onChange={(e) =>
                      change({ ...definition, [k]: e.target.value })
                    }
                  />
                </Field>
              ))}
              <p className="text-sm text-slate-600">
                {t("عدد الأسئلة", "Questions")}: {definition.questions.length}
              </p>
            </fieldset>
          )}
          {tab === 1 && (
            <fieldset disabled={immutable || busy} className="space-y-4">
              <legend className="sr-only">{tabs[1]}</legend>
              {definition.dimensions.map((d, i) => (
                <article key={d.id} className="space-y-3 rounded border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t("اسم البعد", "Dimension name")}>
                      <Input
                        value={d.name}
                        onChange={(e) =>
                          change({
                            ...definition,
                            dimensions: definition.dimensions.map((r, j) =>
                              j === i ? { ...r, name: e.target.value } : r
                            ),
                          })
                        }
                      />
                    </Field>
                    <p className="text-xs text-slate-600" dir="ltr">
                      ID: {d.id}
                    </p>
                    <Field label={t("البعد الأب", "Parent dimension")}>
                      <Select
                        value={d.parent ?? ""}
                        onChange={(parent) =>
                          change({
                            ...definition,
                            dimensions: definition.dimensions.map((r, j) =>
                              j === i
                                ? { ...r, parent: parent || undefined }
                                : r
                            ),
                          })
                        }
                        options={[
                          { value: "", label: t("بدون أب", "No parent") },
                          ...definition.dimensions
                            .filter((r) => r.id !== d.id)
                            .map((r) => ({ value: r.id, label: r.name })),
                        ]}
                      />
                    </Field>
                    <Field label={t("وصف البعد", "Description")}>
                      <Input
                        value={d.description ?? ""}
                        onChange={(e) =>
                          change({
                            ...definition,
                            dimensions: definition.dimensions.map((r, j) =>
                              j === i
                                ? { ...r, description: e.target.value }
                                : r
                            ),
                          })
                        }
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={d.includeInTotal}
                      onChange={(e) =>
                        change({
                          ...definition,
                          dimensions: definition.dimensions.map((r, j) =>
                            j === i
                              ? { ...r, includeInTotal: e.target.checked }
                              : r
                          ),
                        })
                      }
                    />
                    {t("يُضمّن في الكلي", "Include in total")}
                  </label>
                  <RuleEditor
                    value={d.rule}
                    onChange={(rule) =>
                      change({
                        ...definition,
                        dimensions: definition.dimensions.map((r, j) =>
                          j === i ? { ...r, rule } : r
                        ),
                      })
                    }
                    t={t}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      change({
                        ...definition,
                        dimensions: definition.dimensions.filter(
                          (r) => r.id !== d.id
                        ),
                      })
                    }
                  >
                    {t("حذف البعد", "Remove dimension")}
                  </Button>
                </article>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  change({
                    ...definition,
                    dimensions: [
                      ...definition.dimensions,
                      {
                        id: id(),
                        name: "",
                        includeInTotal: true,
                        rule: { method: "sum" },
                      },
                    ],
                  })
                }
              >
                {t("إضافة بعد", "Add dimension")}
              </Button>
            </fieldset>
          )}
          {tab === 2 && (
            <fieldset disabled={immutable || busy} className="space-y-4">
              <legend className="sr-only">{tabs[2]}</legend>
              {definition.answerSets.map((set, i) => (
                <article key={set.id} className="space-y-3 border p-4">
                  <Field label={t("اسم مجموعة الإجابات", "Answer-set name")}>
                    <Input
                      value={set.name}
                      onChange={(e) =>
                        change({
                          ...definition,
                          answerSets: definition.answerSets.map((r, j) =>
                            i === j ? { ...r, name: e.target.value } : r
                          ),
                        })
                      }
                    />
                  </Field>
                  <p className="text-xs text-slate-600" dir="ltr">
                    ID: {set.id}
                  </p>
                  {set.options.map((o, oi) => (
                    <div
                      key={o.id}
                      className="grid gap-2 sm:grid-cols-[1fr_100px_auto]"
                    >
                      <Input
                        aria-label={t("بديل الإجابة", "Answer label")}
                        value={o.label}
                        onChange={(e) =>
                          change({
                            ...definition,
                            answerSets: definition.answerSets.map((r, j) =>
                              i === j
                                ? {
                                    ...r,
                                    options: r.options.map((v, k) =>
                                      k === oi
                                        ? { ...v, label: e.target.value }
                                        : v
                                    ),
                                  }
                                : r
                            ),
                          })
                        }
                      />
                      <Field label={t("الدرجة", "Score")}>
                        <Num
                          value={o.score}
                          onChange={(score) =>
                            change({
                              ...definition,
                              answerSets: definition.answerSets.map((r, j) =>
                                i === j
                                  ? {
                                      ...r,
                                      options: r.options.map((v, k) =>
                                        k === oi ? { ...v, score } : v
                                      ),
                                    }
                                  : r
                              ),
                            })
                          }
                        />
                      </Field>
                      <Button
                        variant="outline"
                        onClick={() =>
                          change({
                            ...definition,
                            answerSets: definition.answerSets.map((r, j) =>
                              i === j
                                ? {
                                    ...r,
                                    options: r.options.filter(
                                      (v) => v.id !== o.id
                                    ),
                                  }
                                : r
                            ),
                          })
                        }
                      >
                        {t("حذف", "Remove")}
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        change({
                          ...definition,
                          answerSets: definition.answerSets.map((r, j) =>
                            i === j
                              ? {
                                  ...r,
                                  options: [
                                    ...r.options,
                                    {
                                      id: id(),
                                      label: "",
                                      score: r.options.length,
                                    },
                                  ],
                                }
                              : r
                          ),
                        })
                      }
                    >
                      {t("إضافة بديل", "Add option")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        change({
                          ...definition,
                          answerSets: definition.answerSets.filter(
                            (r) => r.id !== set.id
                          ),
                        })
                      }
                    >
                      {t("حذف المجموعة", "Remove set")}
                    </Button>
                  </div>
                </article>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  change({
                    ...definition,
                    answerSets: [
                      ...definition.answerSets,
                      { id: id(), name: "", options: [] },
                    ],
                  })
                }
              >
                {t("إضافة مجموعة إجابات", "Add answer set")}
              </Button>
            </fieldset>
          )}
          {tab === 3 && (
            <fieldset disabled={immutable || busy} className="space-y-5">
              <legend className="sr-only">{tabs[3]}</legend>
              <details className="rounded border bg-slate-50 p-4">
                <summary className="font-bold">
                  {t("استيراد أسئلة من Excel", "Import questions from Excel")}
                </summary>
                <div className="mt-4 space-y-3">
                  <Input
                    aria-label={t("ملف Excel", "Excel file")}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      await run(async () => {
                        const x = await import("xlsx")
                        const book = x.read(await file.arrayBuffer(), {
                          type: "array",
                        })
                        const rows = Object.fromEntries(
                          book.SheetNames.map((n) => [
                            n,
                            x.utils.sheet_to_json<Record<string, unknown>>(
                              book.Sheets[n],
                              { defval: "", blankrows: true }
                            ),
                          ])
                        )
                        setSheets(rows)
                        setSheet(book.SheetNames[0] ?? "")
                        setMapping({})
                        setImportPreview([])
                      })
                    }}
                  />
                  {Object.keys(sheets).length > 0 && (
                    <>
                      <Field label={t("ورقة العمل", "Worksheet")}>
                        <Select
                          value={sheet}
                          onChange={(v) => {
                            setSheet(v)
                            setMapping({})
                            setImportPreview([])
                          }}
                          options={Object.keys(sheets).map((v) => ({
                            value: v,
                            label: v,
                          }))}
                        />
                      </Field>
                      <p className="text-sm">
                        {t(
                          "اختر الأعمدة. استخدم معرفات الأبعاد ومجموعات الإجابة، وافصل الأبعاد بفاصلة.",
                          "Map columns. Use dimension and answer-set IDs; separate dimensions with commas."
                        )}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          "text",
                          "order",
                          "dimensions",
                          "weight",
                          "reverse",
                          "critical",
                          "answerSet",
                        ].map((k) => (
                          <Field key={k} label={displayLabel(k, t)}>
                            <Select
                              value={mapping[k] ?? ""}
                              onChange={(v) => {
                                setMapping({ ...mapping, [k]: v })
                                setImportPreview([])
                              }}
                              options={[
                                {
                                  value: "",
                                  label: t("اختر عمودًا", "Choose column"),
                                },
                                ...Object.keys(sheets[sheet]?.[0] ?? {}).map(
                                  (v) => ({ value: v, label: v })
                                ),
                              ]}
                            />
                          </Field>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        disabled={!mapping.text}
                        onClick={() => {
                          setImportPreview([])
                          try {
                            setImportPreview(
                              previewQuestions(
                                sheets[sheet] ?? [],
                                mapping,
                                definition,
                                id
                              )
                            )
                          } catch (e) {
                            const message = getErrorMessage(e)
                            setError(message)
                            toast.error(message)
                          }
                        }}
                      >
                        {t("معاينة قبل الإضافة", "Preview before append")}
                      </Button>
                      {importPreview.length > 0 && (
                        <>
                          <p>
                            {importPreview.length}{" "}
                            {t("سؤالًا للاستيراد", "questions to import")}
                          </p>
                          <div className="max-h-72 overflow-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr>
                                  {[
                                    "order",
                                    "text",
                                    "weight",
                                    "answerSet",
                                    "dimensions",
                                    "reverse",
                                    "critical",
                                  ].map((k) => (
                                    <th key={k} className="p-2 text-start">
                                      {displayLabel(k, t)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {importPreview.map((q) => (
                                  <tr key={q.id} className="border-b">
                                    <td className="p-2">{q.order}</td>
                                    <td>{q.text}</td>
                                    <td>{q.weight}</td>
                                    <td>{q.answerSet}</td>
                                    <td>
                                      {q.dimensions.map((d) => d.id).join(", ")}
                                    </td>
                                    <td>
                                      {q.reverse ? t("عكسي", "Reverse") : "—"}
                                    </td>
                                    <td>
                                      {q.critical ? t("حرج", "Critical") : "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <Button
                            onClick={() => {
                              change({
                                ...definition,
                                questions: [
                                  ...definition.questions,
                                  ...importPreview,
                                ],
                              })
                              setImportPreview([])
                            }}
                          >
                            {t(
                              "إضافة الأسئلة المعاينة",
                              "Append previewed questions"
                            )}
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </details>
              {definition.questions.map((q, i) => (
                <article key={q.id} className="space-y-3 border p-4">
                  <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
                    <Field label={t("الترتيب", "Order")}>
                      <Num
                        value={q.order}
                        onChange={(order) =>
                          change({
                            ...definition,
                            questions: definition.questions.map((r, j) =>
                              i === j ? { ...r, order } : r
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field label={t("نص السؤال", "Question text")}>
                      <textarea
                        className="min-h-20 rounded border p-2"
                        value={q.text}
                        onChange={(e) =>
                          change({
                            ...definition,
                            questions: definition.questions.map((r, j) =>
                              i === j ? { ...r, text: e.target.value } : r
                            ),
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t("مجموعة الإجابة", "Answer set")}>
                      <Select
                        value={q.answerSet}
                        onChange={(answerSet) =>
                          change({
                            ...definition,
                            questions: definition.questions.map((r, j) =>
                              i === j ? { ...r, answerSet } : r
                            ),
                          })
                        }
                        options={[
                          { value: "", label: t("اختر مجموعة", "Choose set") },
                          ...definition.answerSets.map((r) => ({
                            value: r.id,
                            label: r.name,
                          })),
                        ]}
                      />
                    </Field>
                    <Field label={t("وزن السؤال", "Question weight")}>
                      <Num
                        value={q.weight}
                        onChange={(weight) =>
                          change({
                            ...definition,
                            questions: definition.questions.map((r, j) =>
                              i === j ? { ...r, weight } : r
                            ),
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="flex gap-6">
                    {(["reverse", "critical"] as const).map((k) => (
                      <label key={k} className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={q[k]}
                          onChange={(e) =>
                            change({
                              ...definition,
                              questions: definition.questions.map((r, j) =>
                                i === j ? { ...r, [k]: e.target.checked } : r
                              ),
                            })
                          }
                        />
                        {k === "reverse"
                          ? t("عكس الدرجة", "Reverse score")
                          : t("سؤال حرج", "Critical question")}
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {definition.dimensions.map((d) => (
                      <label
                        key={d.id}
                        className="flex items-center gap-2 rounded bg-slate-50 p-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={q.dimensions.some((x) => x.id === d.id)}
                          onChange={(e) =>
                            change({
                              ...definition,
                              questions: definition.questions.map((r, j) =>
                                i === j
                                  ? {
                                      ...r,
                                      dimensions: e.target.checked
                                        ? [
                                            ...r.dimensions,
                                            { id: d.id, weight: 1 },
                                          ]
                                        : r.dimensions.filter(
                                            (x) => x.id !== d.id
                                          ),
                                    }
                                  : r
                              ),
                            })
                          }
                        />
                        {d.name}
                        {q.dimensions.some((x) => x.id === d.id) && (
                          <input
                            className="w-20 rounded border p-1"
                            aria-label={t(
                              "وزن ارتباط البعد",
                              "Dimension-link weight"
                            )}
                            type="number"
                            step="any"
                            value={
                              q.dimensions.find((x) => x.id === d.id)?.weight ??
                              1
                            }
                            onChange={(e) =>
                              change({
                                ...definition,
                                questions: definition.questions.map((r, j) =>
                                  i === j
                                    ? {
                                        ...r,
                                        dimensions: r.dimensions.map((x) =>
                                          x.id === d.id
                                            ? {
                                                ...x,
                                                weight: Number(e.target.value),
                                              }
                                            : x
                                        ),
                                      }
                                    : r
                                ),
                              })
                            }
                          />
                        )}
                      </label>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      change({
                        ...definition,
                        questions: definition.questions.filter(
                          (r) => r.id !== q.id
                        ),
                      })
                    }
                  >
                    {t("حذف السؤال", "Remove question")}
                  </Button>
                </article>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  change({
                    ...definition,
                    questions: [
                      ...definition.questions,
                      {
                        id: id(),
                        order: definition.questions.length + 1,
                        text: "",
                        dimensions: [],
                        weight: 1,
                        reverse: false,
                        critical: false,
                        answerSet: definition.answerSets[0]?.id ?? "",
                      },
                    ],
                  })
                }
              >
                {t("إضافة سؤال", "Add question")}
              </Button>
            </fieldset>
          )}
          {tab === 4 && (
            <fieldset disabled={immutable || busy} className="space-y-5">
              <legend className="sr-only">{tabs[4]}</legend>
              <h3 className="font-bold">
                {t("حساب الدرجة الكلية", "Total score rule")}
              </h3>
              <RuleEditor
                value={definition.totalRule}
                onChange={(totalRule) => change({ ...definition, totalRule })}
                t={t}
              />
              <h3 className="font-bold">
                {t("المؤشرات الإضافية", "Additional indicators")}
              </h3>
              {definition.indicators.map((r, i) => (
                <article key={r.id} className="space-y-3 border p-3">
                  <Field label={t("اسم المؤشر", "Indicator name")}>
                    <Input
                      value={r.name}
                      onChange={(e) =>
                        change({
                          ...definition,
                          indicators: definition.indicators.map((x, j) =>
                            i === j ? { ...x, name: e.target.value } : x
                          ),
                        })
                      }
                    />
                  </Field>
                  <p className="text-xs text-slate-500" dir="ltr">
                    ID: {r.id}
                  </p>
                  <RuleEditor
                    value={r.rule}
                    onChange={(rule) =>
                      change({
                        ...definition,
                        indicators: definition.indicators.map((x, j) =>
                          i === j ? { ...x, rule } : x
                        ),
                      })
                    }
                    t={t}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      change({
                        ...definition,
                        indicators: definition.indicators.filter(
                          (x) => x.id !== r.id
                        ),
                      })
                    }
                  >
                    {t("حذف المؤشر", "Remove indicator")}
                  </Button>
                </article>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  change({
                    ...definition,
                    indicators: [
                      ...definition.indicators,
                      { id: id(), name: "", rule: { method: "sum" } },
                    ],
                  })
                }
              >
                {t("إضافة مؤشر", "Add indicator")}
              </Button>
            </fieldset>
          )}
          {tab === 5 && (
            <fieldset disabled={immutable || busy} className="space-y-5">
              <legend className="sr-only">{tabs[5]}</legend>
              <h3 className="font-bold">
                {t(
                  "نطاقات التفسير والتوصيات",
                  "Interpretation bands & recommendations"
                )}
              </h3>
              {definition.bands.map((b, i) => (
                <article key={b.id} className="space-y-3 border p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label={t("الدرجة المستهدفة", "Target score")}>
                      <Select
                        value={b.target}
                        onChange={(target) =>
                          change({
                            ...definition,
                            bands: definition.bands.map((r, j) =>
                              i === j ? { ...r, target } : r
                            ),
                          })
                        }
                        options={targets}
                      />
                    </Field>
                    {(["min", "max"] as const).map((k) => (
                      <Field key={k} label={displayLabel(k, t)}>
                        <Num
                          value={b[k]}
                          onChange={(v) =>
                            change({
                              ...definition,
                              bands: definition.bands.map((r, j) =>
                                i === j ? { ...r, [k]: v } : r
                              ),
                            })
                          }
                        />
                      </Field>
                    ))}
                  </div>
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={!!b.includeMax}
                      onChange={(e) =>
                        change({
                          ...definition,
                          bands: definition.bands.map((r, j) =>
                            i === j ? { ...r, includeMax: e.target.checked } : r
                          ),
                        })
                      }
                    />
                    {t("يشمل الحد الأعلى", "Include upper bound")}
                  </label>
                  <Field label={t("التفسير", "Interpretation")}>
                    <Input
                      value={b.label}
                      onChange={(e) =>
                        change({
                          ...definition,
                          bands: definition.bands.map((r, j) =>
                            i === j ? { ...r, label: e.target.value } : r
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label={t("التوصية", "Recommendation")}>
                    <Input
                      value={b.recommendation ?? ""}
                      onChange={(e) =>
                        change({
                          ...definition,
                          bands: definition.bands.map((r, j) =>
                            i === j
                              ? { ...r, recommendation: e.target.value }
                              : r
                          ),
                        })
                      }
                    />
                  </Field>
                  <PopulationFields
                    value={b.population ?? {}}
                    onChange={(population) =>
                      change({
                        ...definition,
                        bands: definition.bands.map((r, j) =>
                          i === j ? { ...r, population } : r
                        ),
                      })
                    }
                    t={t}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      change({
                        ...definition,
                        bands: definition.bands.filter((r) => r.id !== b.id),
                      })
                    }
                  >
                    {t("حذف النطاق", "Remove band")}
                  </Button>
                </article>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  change({
                    ...definition,
                    bands: [
                      ...definition.bands,
                      {
                        id: id(),
                        target: "overall",
                        min: 0,
                        max: 0,
                        label: "",
                      },
                    ],
                  })
                }
              >
                {t("إضافة نطاق", "Add band")}
              </Button>
              <h3 className="font-bold">{t("التنبيهات", "Alerts")}</h3>
              {definition.alerts.map((a, i) => (
                <article key={a.id} className="space-y-3 border p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label={t("السؤال أو الدرجة", "Question or score")}>
                      <Select
                        value={a.target}
                        onChange={(target) =>
                          change({
                            ...definition,
                            alerts: definition.alerts.map((r, j) =>
                              i === j ? { ...r, target } : r
                            ),
                          })
                        }
                        options={[
                          ...targets,
                          ...definition.questions.map((q) => ({
                            value: `question:${q.id}`,
                            label: `${q.order}. ${q.text}`,
                          })),
                        ]}
                      />
                    </Field>
                    <Field label={t("المقارنة", "Operator")}>
                      <Select
                        value={a.operator}
                        onChange={(operator) =>
                          change({
                            ...definition,
                            alerts: definition.alerts.map((r, j) =>
                              i === j
                                ? {
                                    ...r,
                                    operator: operator as typeof a.operator,
                                  }
                                : r
                            ),
                          })
                        }
                        options={["gt", "gte", "lt", "lte", "eq"].map((v) => ({
                          value: v,
                          label: displayLabel(v, t),
                        }))}
                      />
                    </Field>
                    <Field label={t("الحد", "Threshold")}>
                      <Num
                        value={a.threshold}
                        onChange={(threshold) =>
                          change({
                            ...definition,
                            alerts: definition.alerts.map((r, j) =>
                              i === j ? { ...r, threshold } : r
                            ),
                          })
                        }
                      />
                    </Field>
                  </div>
                  {(["message", "recommendation"] as const).map((k) => (
                    <Field
                      key={k}
                      label={
                        k === "message"
                          ? t("رسالة التنبيه", "Alert message")
                          : t("التوصية", "Recommendation")
                      }
                    >
                      <Input
                        value={a[k] ?? ""}
                        onChange={(e) =>
                          change({
                            ...definition,
                            alerts: definition.alerts.map((r, j) =>
                              i === j ? { ...r, [k]: e.target.value } : r
                            ),
                          })
                        }
                      />
                    </Field>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      change({
                        ...definition,
                        alerts: definition.alerts.filter((r) => r.id !== a.id),
                      })
                    }
                  >
                    {t("حذف التنبيه", "Remove alert")}
                  </Button>
                </article>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  change({
                    ...definition,
                    alerts: [
                      ...definition.alerts,
                      {
                        id: id(),
                        target: "overall",
                        operator: "gte",
                        threshold: 0,
                        message: "",
                      },
                    ],
                  })
                }
              >
                {t("إضافة تنبيه", "Add alert")}
              </Button>
            </fieldset>
          )}
          {(tab === 6 || tab === 7) && (
            <div className="space-y-5">
              {tab === 6 && (
                <div className="space-y-3 rounded border border-amber-300 bg-amber-50 p-4">
                  <p>
                    {t(
                      "احفظ المسودة ثم جرّب إجاباتها قبل النشر. الإصدار المنشور لا يُعدّل؛ أنشئ إصدارًا جديدًا لتغييره.",
                      "Save and test your draft before publishing. Published definitions are immutable; clone a new version to change them."
                    )}
                  </p>
                  {record?.status === "draft" && data.canManage && (
                    <Button
                      disabled={busy || dirty || !record.tested}
                      onClick={() =>
                        run(async () => {
                          const r = await pb.send<AssessmentRecord>(
                            `/api/dsc/assessments/${record.id}/publish`,
                            { method: "POST" }
                          )
                          setRecord(r)
                          setDefinition(r.definition)
                          setData((d) =>
                            d
                              ? {
                                  ...d,
                                  assessments: d.assessments.map((a) =>
                                    a.id === r.id ? r : a
                                  ),
                                }
                              : d
                          )
                        })
                      }
                    >
                      {t("نشر الإصدار المختبَر", "Publish tested version")}
                    </Button>
                  )}
                  {record?.status === "published" && data.canCreate && (
                    <div className="flex gap-2">
                      <Input
                        aria-label={t("رقم الإصدار الجديد", "New version")}
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                      />
                      <Button
                        disabled={busy || !version.trim()}
                        onClick={() =>
                          run(async () => {
                            const r = await pb.send<AssessmentRecord>(
                              `/api/dsc/assessments/${record.id}/clone`,
                              { method: "POST", body: { version } }
                            )
                            setRecord(r)
                            setDefinition(r.definition)
                            setImportPreview([])
                            setAnswers({})
                            setResult(null)
                            setData((d) =>
                              d
                                ? { ...d, assessments: [...d.assessments, r] }
                                : d
                            )
                            setTab(0)
                          })
                        }
                      >
                        {t("نسخ لإصدار جديد", "Clone new version")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {tab === 7 && (
                <div className="space-y-3 print:hidden">
                  <h3 className="font-bold">
                    {t("التطبيقات المحفوظة", "Saved sessions")}
                  </h3>
                  <Select
                    value={session?.id ?? ""}
                    onChange={(v) => {
                      if (!v) return
                      void run(async () => {
                        const s = await pb.send<SessionRecord>(
                          `/api/dsc/assessment-sessions/${v}`,
                          { method: "GET" }
                        )
                        setSession(s)
                        setAnswers(s.answers ?? {})
                        setPopulation(s.population)
                        setResult(s.result ?? null)
                      })
                    }}
                    options={[
                      { value: "", label: t("اختر تطبيقًا", "Choose session") },
                      ...data.sessions.map((s) => ({
                        value: s.id,
                        label: `${data.assessments.find((a) => a.id === s.assessment)?.name ?? s.assessment} · ${data.cases.find((c) => c.id === s.case)?.name ?? s.case} · ${s.status}`,
                      })),
                    ]}
                  />
                  <div className="flex flex-wrap gap-2">
                    <div className="min-w-48 flex-1">
                      <Select
                        value={caseId}
                        onChange={setCaseId}
                        options={[
                          { value: "", label: t("اختر الحالة", "Choose case") },
                          ...data.cases.map((c) => ({
                            value: c.id,
                            label: c.name,
                          })),
                        ]}
                      />
                    </div>
                    <Button
                      disabled={
                        busy || !caseId || record?.status !== "published"
                      }
                      onClick={() =>
                        run(async () => {
                          const s = await pb.send<SessionRecord>(
                            "/api/dsc/assessment-sessions",
                            {
                              method: "POST",
                              body: {
                                assessment: record!.id,
                                case: caseId,
                                population,
                              },
                            }
                          )
                          setSession(s)
                          setAnswers(s.answers ?? {})
                          setResult(null)
                          setData((d) =>
                            d ? { ...d, sessions: [s, ...d.sessions] } : d
                          )
                        })
                      }
                    >
                      {t("بدء تطبيق على الحالة", "Start case session")}
                    </Button>
                  </div>
                </div>
              )}
              <AssessmentInstructions
                lang={lang}
                instructions={
                  (tab === 7 ? session?.snapshot : definition)?.instructions
                }
                referencePeriod={
                  (tab === 7 ? session?.snapshot : definition)?.referencePeriod
                }
                respondentNotice={
                  (tab === 7 ? session?.snapshot : definition)?.respondentNotice
                }
              />
              <fieldset
                disabled={
                  busy ||
                  session?.status === "completed" ||
                  !!session?.recipient
                }
                className="space-y-4"
              >
                <legend className="font-bold">
                  {t("بيانات المفحوص", "Respondent population")}
                </legend>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Field label={t("العمر", "Age")}>
                    <Input
                      fieldWidth="short" type="number"
                      min="0"
                      disabled={tab === 7 && !!session}
                      value={population.age ?? ""}
                      onChange={(e) => {
                        setResult(null)
                        setPopulation({
                          ...population,
                          age: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }}
                    />
                  </Field>
                  {(["sex", "language", "group"] as const).map((k) => (
                    <Field key={k} label={displayLabel(k, t)}>
                      <Input
                        disabled={tab === 7 && !!session}
                        value={population[k] ?? ""}
                        onChange={(e) => {
                          setResult(null)
                          setPopulation({ ...population, [k]: e.target.value })
                        }}
                      />
                    </Field>
                  ))}
                </div>
                <AnswerMatrix
                  lang={lang}
                  disabled={
                    busy ||
                    session?.status === "completed" ||
                    !!session?.recipient
                  }
                  questions={(tab === 7
                    ? (session?.snapshot.questions ?? [])
                    : definition.questions
                  ).map((q) => ({
                    ...q,
                    options:
                      (tab === 7 ? session?.snapshot : definition)?.answerSets
                        .find((set) => set.id === q.answerSet)
                        ?.options.map((o) => ({ id: o.id, label: o.label })) ??
                      [],
                  }))}
                  answers={answers}
                  onChange={(question, option) => {
                    setAnswers((a) => {
                      const next = { ...a }
                      if (option) next[question] = option
                      else delete next[question]
                      return next
                    })
                    setResult(null)
                  }}
                />
              </fieldset>
              {tab === 6 && (
                <Button
                  disabled={busy || dirty || !record}
                  onClick={() =>
                    run(async () => {
                      const r = await pb.send<Result>(
                        `/api/dsc/assessments/${record!.id}/preview`,
                        { method: "POST", body: { answers, population } }
                      )
                      setResult(r)
                      setRecord((a) => (a ? { ...a, tested: true } : a))
                    })
                  }
                >
                  {t("حساب التجربة على الخادم", "Calculate preview on server")}
                </Button>
              )}
              {tab === 7 &&
                session &&
                !session.recipient &&
                session.status !== "completed" && (
                  <div className="flex gap-2 print:hidden">
                    {[false, true].map((finalize) => (
                      <Button
                        key={String(finalize)}
                        variant={finalize ? "default" : "outline"}
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            const s = await pb.send<SessionRecord>(
                              `/api/dsc/assessment-sessions/${session.id}/submit`,
                              { method: "POST", body: { answers, finalize } }
                            )
                            setSession(s)
                            setResult(s.result ?? null)
                            setData((d) =>
                              d
                                ? {
                                    ...d,
                                    sessions: d.sessions.map((x) =>
                                      x.id === s.id ? s : x
                                    ),
                                  }
                                : d
                            )
                          })
                        }
                      >
                        {finalize
                          ? t(
                              "إنهاء التطبيق وحساب التقرير",
                              "Finalize & calculate report"
                            )
                          : t("حفظ الإجابات", "Save answers")}
                      </Button>
                    ))}
                  </div>
                )}
              {result && (tab === 6 || !!session) && (
                <section className="assessment-report space-y-4">
                  <header className="border-b pb-3">
                    <h2 className="text-2xl font-bold">
                      {session?.snapshot.name ?? definition.name}
                    </h2>
                    <p>
                      {t("الإصدار", "Version")}:{" "}
                      {session?.snapshot.version ?? definition.version} ·{" "}
                      {session
                        ? t("تقرير حالة", "Case report")
                        : t("تجربة", "Preview")}
                    </p>
                    {session && (
                      <>
                        <p>
                          {t("الحالة", "Case")}:{" "}
                          {data.cases.find((c) => c.id === session.case)
                            ?.name ?? session.case}
                        </p>
                        <p>
                          {t("رقم التطبيق", "Session")}: {session.id} ·{" "}
                          {session.created} · {session.status} ·{" "}
                          {t("المنفذ", "Operator")}: {session.operator}
                        </p>
                      </>
                    )}
                  </header>
                  <Results
                    result={result}
                    t={t}
                    questions={(session?.snapshot ?? definition).questions}
                  />
                  <div className="flex flex-wrap gap-2 print:hidden">
                    <Button variant="outline" onClick={() => window.print()}>
                      {t("طباعة / PDF", "Print / PDF")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportResult("json")}
                    >
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportResult("csv")}
                    >
                      CSV
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}
        </section>
      </div>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .assessment-report,
          .assessment-report * {
            visibility: visible;
          }
          .assessment-report {
            position: absolute;
            inset: 0;
            background: white;
            padding: 20px;
            overflow: visible;
          }
          .assessment-report details {
            display: block;
          }
          .assessment-report article {
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  )
}
