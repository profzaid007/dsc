// lib/sanitizeCmsContent.js

export function sanitizeCmsContent(html: string, lang?: string): string {
  let out = html
    .replace(/<figure([^>]*?)style="[^"]*?"([^>]*?)>/gi, "<figure$1$2>")
    .replace(/<iframe([^>]*?)style="[^"]*?"([^>]*?)>/gi, "<iframe$1$2>")

  if (lang === "ar") {
    // Remove hard-coded LTR direction so the page's RTL direction applies
    out = out.replace(/dir="ltr"/gi, "")
    // Flip text alignment baked in while the editor was in LTR mode
    out = out.replace(/text-align:\s*left/gi, "text-align: right")
  }

  return out
}
