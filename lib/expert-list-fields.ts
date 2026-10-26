/** Text-list fields accept only comma-separated text, never arrays or JSON text. */
export function toStringList(value: unknown, field = "expert profile text list"): string[] {
  if (value == null || value === "") return []
  if (typeof value !== "string" || /^[\s]*[\[{]/.test(value))
    throw new Error(`${field} needs correction: use comma-separated text.`)
  return value.split(",").map(item => item.trim()).filter(Boolean)
}

/** Relations and multi-file fields are native arrays, not text-list fields. */
export function recordStringArray(value: unknown, field = "expert profile relation or files"): string[] {
  if (value == null) return []
  if (!Array.isArray(value) || value.some(item => typeof item !== "string"))
    throw new Error(`${field} needs correction: expected a database array.`)
  return value
}
