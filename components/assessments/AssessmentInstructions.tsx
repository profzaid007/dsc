"use client"
export default function AssessmentInstructions({
  instructions,
  referencePeriod,
  respondentNotice,
  lang = "ar",
}: {
  instructions?: string
  referencePeriod?: string
  respondentNotice?: string
  lang?: string
}) {
  const ar = lang === "ar"
  if (!instructions && !referencePeriod && !respondentNotice) return null
  return (
    <section
      aria-label={
        ar
          ? "مقدمة وتعليمات التقييم"
          : "Assessment introduction and instructions"
      }
      className="space-y-4 rounded-lg border border-s-4 border-slate-200 border-s-primary bg-slate-50 p-5"
      dir={ar ? "rtl" : "ltr"}
    >
      {instructions && (
        <div>
          <h2 className="mb-2 font-bold text-primary">
            {ar ? "المقدمة والتعليمات" : "Introduction and instructions"}
          </h2>
          <p className="leading-8 whitespace-pre-wrap text-slate-800">
            {instructions}
          </p>
        </div>
      )}
      {referencePeriod && (
        <div>
          <h3 className="font-bold text-primary">
            {ar ? "الفترة الزمنية المرجعية" : "Reference period"}
          </h3>
          <p className="leading-8 whitespace-pre-wrap text-slate-800">
            {referencePeriod}
          </p>
        </div>
      )}
      {respondentNotice && (
        <aside className="rounded border border-amber-200 bg-amber-50 p-3">
          <h3 className="font-bold text-amber-950">
            {ar ? "تنبيه للمجيب" : "Notice to respondent"}
          </h3>
          <p className="leading-8 whitespace-pre-wrap text-amber-950">
            {respondentNotice}
          </p>
        </aside>
      )}
    </section>
  )
}
