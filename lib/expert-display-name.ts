/** Choose the public name in the interface language without changing account data. */
export function expertDisplayName(
  profile: { public_name_ar?: string; public_name_en?: string } | null | undefined,
  lang: string,
  fallback = "",
): string {
  const ar = profile?.public_name_ar?.trim()
  const en = profile?.public_name_en?.trim()
  return (lang === "ar" ? ar || en : en || ar) || fallback
}
