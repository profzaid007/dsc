"use client"
import { useId } from "react"
import type { Answers } from "@/lib/assessments/types"

export type AnswerRow = {
  id: string
  order: number
  text: string
  options: { id: string; label: string }[]
}
/** Contiguous groups preserve original question order even when answer sets alternate. */
export function groupAnswerRows(questions: AnswerRow[]) {
  const groups: { key: string; rows: AnswerRow[] }[] = []
  for (const question of questions.slice().sort((a, b) => a.order - b.order)) {
    const key = JSON.stringify(question.options.map((o) => [o.id, o.label]))
    const last = groups[groups.length - 1]
    if (last?.key === key) last.rows.push(question)
    else groups.push({ key, rows: [question] })
  }
  return groups
}
export default function AnswerMatrix({
  questions,
  answers,
  onChange,
  disabled = false,
  lang = "ar",
  allowClear = true,
}: {
  questions: AnswerRow[]
  answers: Answers
  onChange: (question: string, option: string) => void
  disabled?: boolean
  lang?: string
  allowClear?: boolean
}) {
  const prefix = useId()
  const ar = lang === "ar"
  const groups = groupAnswerRows(questions)
  if (!questions.length)
    return (
      <p className="rounded border border-dashed p-4 text-slate-600">
        {ar ? "لا توجد أسئلة لعرضها." : "There are no questions to display."}
      </p>
    )
  return (
    <div className="space-y-5" dir={ar ? "rtl" : "ltr"}>
      {groups.map((group, index) => (
        <div
          key={`${group.key}-${index}`}
          className="max-h-[70vh] overflow-auto rounded-lg border border-slate-300 bg-white focus-visible:outline-2 focus-visible:outline-primary"
          role="region"
          aria-label={
            ar
              ? `جدول الإجابات ${index + 1}، يمكن تمريره أفقيًا`
              : `Answer table ${index + 1}, scroll horizontally`
          }
          tabIndex={0}
        >
          <table className="w-full border-separate border-spacing-0 text-sm">
            <caption className="sr-only">
              {ar
                ? "اختر إجابة واحدة في كل صف. خيارات الإجابة في رؤوس الأعمدة."
                : "Choose one answer per row. Answer options are column headers."}
            </caption>
            <thead className="sticky top-0 z-20">
              <tr>
                <th
                  scope="col"
                  className="sticky start-0 z-30 min-w-64 border-e border-b border-slate-300 bg-[#0b4263] p-3 text-start font-bold text-white"
                >
                  {ar ? "السؤال" : "Question"}
                </th>
                {group.rows[0].options.map((option) => (
                  <th
                    key={option.id}
                    scope="col"
                    className="min-w-28 border-e border-b border-slate-300 bg-[#0b4263] px-3 py-4 text-center font-semibold text-white"
                  >
                    {option.label}
                  </th>
                ))}
                {allowClear && !disabled && (
                  <th
                    scope="col"
                    className="min-w-24 border-b border-slate-300 bg-[#0b4263] p-3 text-center text-white"
                  >
                    {ar ? "مسح" : "Clear"}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {group.rows.map((question) => (
                <tr key={question.id}>
                  <th
                    scope="row"
                    className="sticky start-0 z-10 max-w-md min-w-64 border-e border-b border-slate-200 bg-white p-4 text-start leading-7 font-medium text-slate-900"
                  >
                    <span className="me-2 text-slate-500">
                      {question.order}.
                    </span>
                    {question.text}
                  </th>
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id
                    return (
                      <td
                        key={option.id}
                        className={`border-e border-b border-slate-200 p-0 text-center ${selected ? "bg-sky-100" : "bg-white hover:bg-slate-50"}`}
                      >
                        <label
                          className={`flex min-h-14 min-w-11 items-center justify-center p-3 ${disabled ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <input
                            type="radio"
                            className="h-5 w-5 accent-[#0b4263] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-70"
                            name={`${prefix}-question-${question.id}`}
                            value={option.id}
                            checked={selected}
                            disabled={disabled}
                            aria-label={`${question.order}. ${question.text} — ${option.label}`}
                            onChange={() => onChange(question.id, option.id)}
                          />
                        </label>
                      </td>
                    )
                  })}
                  {allowClear && !disabled && (
                    <td className="border-b border-slate-200 px-2 text-center">
                      <button
                        type="button"
                        disabled={!answers[question.id]}
                        className="min-h-11 min-w-11 rounded px-2 text-xs text-slate-600 underline hover:bg-slate-100 disabled:opacity-30"
                        aria-label={`${ar ? "مسح إجابة" : "Clear answer for"} ${question.order}. ${question.text}`}
                        onClick={() => onChange(question.id, "")}
                      >
                        {ar ? "مسح" : "Clear"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
