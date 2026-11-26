import { parseDate, dayKey } from "@/lib/event-dates"
import { formatDate } from "@/lib/format-date"

/** Naive schedule values keep their wall-clock time on SSR and hydration. */
export function publicEventDate(
  value: string,
  hydrated: boolean,
  end = false
): Date {
  if (!hydrated) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value))
      return new Date(`${value}T${end ? "23:59:59.999" : "00:00:00"}Z`)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value))
      return new Date(`${value}Z`)
  }
  return parseDate(value, end)
}
export function publicEventDay(date: Date, hydrated: boolean): string {
  if (Number.isNaN(date.getTime())) return ""
  return hydrated ? dayKey(date) : date.toISOString().slice(0, 10)
}
export function publicEventDateLabel(value: string, hydrated: boolean): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDate(value)
  const date = publicEventDate(value, hydrated)
  if (Number.isNaN(date.getTime())) return ""
  return hydrated
    ? formatDate(date)
    : date.toISOString().slice(0, 10).split("-").reverse().join("-")
}
