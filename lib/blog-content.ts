/** Blog posts have one authored version, independent of the interface language.
 * Keep legacy Arabic fields as a fallback without deleting existing translations.
 */
export function blogField(
  post: { title_en?: string; title_ar?: string; content_en?: string; content_ar?: string },
  field: "title" | "content"
): string {
  return post[`${field}_en`] || post[`${field}_ar`] || ""
}

export function blogContentLang(html: string): "ar" | "en" {
  const text = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, "")
  const firstLetter = text.match(/[\p{L}]/u)?.[0] ?? ""
  return /\p{Script=Arabic}/u.test(firstLetter) ? "ar" : "en"
}

// Mirror the one authored version into the existing schema for older clients.
export function blogContentPayload(title: string, content: string) {
  return { title_en: title, title_ar: title, content_en: content, content_ar: content }
}
