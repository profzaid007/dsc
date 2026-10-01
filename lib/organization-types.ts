import type { BilingualString } from "@/types/form"

export interface OrganizationType {
  label: BilingualString
  value: string
}

/** Values stored in `organization_profiles.organization_type`. */
export const ORGANIZATION_TYPES: OrganizationType[] = [
  { label: { en: "School", ar: "مدرسة" }, value: "school" },
  { label: { en: "NGO", ar: "منظمة غير ربحية" }, value: "ngo" },
  { label: { en: "Corporate", ar: "شركة" }, value: "corporate" },
  { label: { en: "Government", ar: "جهة حكومية" }, value: "government" },
  { label: { en: "Clinic", ar: "عيادة" }, value: "clinic" },
  { label: { en: "Hospital", ar: "مستشفى" }, value: "hospital" },
  { label: { en: "Other", ar: "أخرى" }, value: "other" },
]

const ORGANIZATION_TYPE_LABELS: Record<string, BilingualString> =
  Object.fromEntries(ORGANIZATION_TYPES.map((type) => [type.value, type.label]))

export function organizationTypeLabel(
  value: string,
  lang: "en" | "ar"
): string {
  const known = ORGANIZATION_TYPE_LABELS[value.trim()]
  if (known) return known[lang]
  return value.trim().replace(/_/g, " ")
}