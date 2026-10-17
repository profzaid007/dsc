import { parseDocument } from "htmlparser2"

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
  const text = blogPlainText(html)
  const firstLetter = text.match(/[\p{L}]/u)?.[0] ?? ""
  return /\p{Script=Arabic}/u.test(firstLetter) ? "ar" : "en"
}

// Mirror the one authored version into the existing schema for older clients.
export function blogContentPayload(title: string, content: string) {
  return { title_en: title, title_ar: title, content_en: content, content_ar: content }
}

/** Extract article text without exposing document metadata, styles or executable code. */
export function blogPlainText(html: string): string {
  const document = parseDocument(html, { decodeEntities: true })
  type Node = (typeof document.children)[number]
  const excluded = new Set(["head", "title", "style", "script", "noscript", "template", "svg"])
  const text = (node: Node): string => {
    if (node.type === "text") return node.data
    if ("name" in node && excluded.has(node.name.toLowerCase())) return ""
    if ("attribs" in node && ("hidden" in node.attribs || node.attribs["aria-hidden"] === "true")) return ""
    return "children" in node ? node.children.map(text).join(" ") : ""
  }
  return document.children.map(text).join(" ").replace(/\s+/gu, " ").trim()
}

/** PocketBase ignores unknown fields: check before clearing the legacy category. */
export function assertBlogClassificationSchema(record: Record<string, unknown>) {
  if (!["main_category", "keywords"].every(field => Object.prototype.hasOwnProperty.call(record, field))) {
    throw new Error("يلزم تحديث قاعدة بيانات الخادم لحفظ التصنيف والكلمات المفتاحية. لم تُحفظ التغييرات ولم يُمسح التصنيف القديم. / Update the server database before saving classifications and keywords.")
  }
}
