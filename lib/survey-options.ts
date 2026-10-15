// Keep legacy string labels readable when no Arabic translation exists.
export function surveyOptionLabel(
  option: { label: string; labelAr?: string },
  lang: "en" | "ar"
): string {
  return lang === "ar" ? option.labelAr?.trim() || option.label : option.label
}
