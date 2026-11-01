type PersonNames = {
  name?: string
  name_ar?: string
  name_en?: string
  public_name_ar?: string
  public_name_en?: string
}

export function personName(person: PersonNames | null | undefined, lang: "ar" | "en") {
  const text = (value: unknown) => typeof value === "string" ? value.trim() : ""
  if (!person) return ""
  const preferred = lang === "ar" ? [person.name_ar, person.public_name_ar] : [person.name_en, person.public_name_en]
  const other = lang === "ar" ? [person.name_en, person.public_name_en] : [person.name_ar, person.public_name_ar]
  return [...preferred, person.name, ...other].map(text).find(Boolean) || ""
}
