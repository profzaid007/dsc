// lib/sanitizeCmsContent.js

export function sanitizeCmsContent(html: string): string {
  return html
    .replace(/<figure([^>]*?)style="[^"]*?"([^>]*?)>/gi, '<figure$1$2>')
    .replace(/<iframe([^>]*?)style="[^"]*?"([^>]*?)>/gi, '<iframe$1$2>')
}
