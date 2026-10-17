import type { Definition, Question } from "@/lib/assessments/types"

/** Import is atomic: every populated row must validate before any question is appended. */
export function previewQuestions(
  rows: Record<string, unknown>[],
  mapping: Record<string, string>,
  definition: Definition,
  createId: () => string
): Question[] {
  if (!mapping.text)
    throw new Error("اختر عمود السؤال / Map the question text column")
  if (!rows.length) throw new Error("الورقة فارغة / The worksheet is empty")
  if (definition.questions.length + rows.length > 2000)
    throw new Error("الحد الأعلى 2000 سؤال / Maximum 2000 questions")
  const seenOrders = new Set(definition.questions.map((q) => q.order))
  const maxOrder = Math.max(0, ...seenOrders)
  return rows.map((row, index) => {
    const fail = (message: string): never => {
      throw new Error(`الصف / Row ${index + 2}: ${message}`)
    }
    const value = (key: string) =>
      mapping[key] ? String(row[mapping[key]] ?? "").trim() : ""
    const text = value("text")
    if (!text) fail("نص السؤال فارغ / Question text is blank")
    const number = (key: string, fallback: number) => {
      if (!mapping[key]) return fallback
      if (!value(key)) return fail(`${key}: قيمة فارغة / blank number`)
      const result = Number(value(key))
      if (!Number.isFinite(result))
        return fail(`${key}: رقم غير صالح / invalid number`)
      return result
    }
    const order = number("order", maxOrder + index + 1)
    if (!Number.isInteger(order) || order < 1 || seenOrders.has(order))
      fail(
        "ترتيب السؤال غير صالح أو مكرر / Invalid or duplicate question order"
      )
    seenOrders.add(order)
    const weight = number("weight", 1)
    if (weight <= 0 || weight > 1000)
      fail(
        "وزن السؤال يجب أن يكون أكبر من صفر وحتى 1000 / Weight must be > 0 and <= 1000"
      )
    const boolean = (key: string) => {
      if (!mapping[key]) return false
      const v = value(key).toLowerCase()
      if (["true", "1", "yes", "نعم"].includes(v)) return true
      if (["false", "0", "no", "لا"].includes(v)) return false
      return fail(`${key}: استخدم نعم أو لا / Use yes or no`)
    }
    const answerSet = mapping.answerSet
      ? value("answerSet")
      : definition.answerSets.length === 1
        ? definition.answerSets[0].id
        : ""
    if (!definition.answerSets.some((s) => s.id === answerSet))
      fail("مجموعة إجابات مفقودة أو غير معروفة / Missing or unknown answer set")
    const dimensions = value("dimensions")
      .split(/[,،]/)
      .map((v) => v.trim())
      .filter(Boolean)
    if (
      new Set(dimensions).size !== dimensions.length ||
      dimensions.some((v) => !definition.dimensions.some((d) => d.id === v))
    )
      fail("بعد غير معروف أو مكرر / Unknown or duplicate dimension")
    return {
      id: createId(),
      text,
      order,
      weight,
      reverse: boolean("reverse"),
      critical: boolean("critical"),
      answerSet,
      dimensions: dimensions.map((id) => ({ id, weight: 1 })),
    }
  })
}
