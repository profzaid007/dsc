function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

export function formatDate(input: string | Date): string {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-")
    return `${d}-${m}-${y}`
  }
  const dt = new Date(input)
  if (Number.isNaN(dt.getTime())) return ""
  return `${pad2(dt.getDate())}-${pad2(dt.getMonth() + 1)}-${dt.getFullYear()}`
}

export function formatDateTime(input: string | Date): string {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ""
  return `${formatDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function parseISODate(s: string): Date | null {
  if (!s) return null
  const d = new Date(`${s}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
