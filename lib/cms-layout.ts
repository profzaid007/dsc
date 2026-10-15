import sanitizeHtml from "sanitize-html"
import { DomUtils, parseDocument } from "htmlparser2"

const marker = "<!--dsc:custom-layout:v1-->"
export const CMS_LAYOUT_SANDBOX =
  "allow-same-origin allow-popups allow-popups-to-escape-sandbox"
export const CMS_LAYOUT_CSP =
  "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src https: http: data:; media-src https: http: data:; font-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"

export function isCustomCmsLayout(html: string): boolean {
  return (
    html.trimStart().startsWith(marker) ||
    /<!doctype\s+html\b|<(?:html|head|style)\b/i.test(html)
  )
}

export function cmsLayoutSource(html: string): string {
  return html.trimStart().startsWith(marker)
    ? html.slice(html.indexOf(marker) + marker.length).replace(/^\r?\n/, "")
    : html
}

export function storeCmsLayout(source: string): string {
  return `${marker}\n${cmsLayoutSource(source)}`
}

const escapeAttribute = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

function rootAttributes(attributes: Record<string, string>) {
  return Object.entries(attributes)
    .filter(([key]) => ["lang", "dir", "class", "style"].includes(key))
    .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
    .join(" ")
}

/** CSS is intentionally preserved only inside the script-free sandboxed document. */
export function buildCmsLayoutDocument(
  html: string,
  lang: "ar" | "en"
): string {
  const source = cmsLayoutSource(html)
  const document = parseDocument(source)
  const htmlElement = DomUtils.findOne(
    (element) => element.name === "html",
    document.children,
    true
  )
  const head = DomUtils.findOne(
    (element) => element.name === "head",
    document.children,
    true
  )
  const body = DomUtils.findOne(
    (element) => element.name === "body",
    document.children,
    true
  )
  const styles = head
    ? DomUtils.getElementsByTagName("style", head.children, true)
        .map((element) => DomUtils.getOuterHTML(element))
        .join("\n")
    : ""
  // Full documents retain body attributes; fragments retain their own wrapper.
  const content = body
    ? DomUtils.getInnerHTML(body)
    : DomUtils.getOuterHTML(document)
  const clean = sanitizeHtml(styles + content, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "style",
      "img",
      "video",
      "audio",
      "source",
    ],
    allowedAttributes: {
      "*": [
        "id",
        "class",
        "style",
        "dir",
        "lang",
        "title",
        "role",
        "aria-label",
        "aria-hidden",
      ],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      video: ["src", "controls", "poster", "width", "height", "preload"],
      audio: ["src", "controls", "preload"],
      source: ["src", "type"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowProtocolRelative: false,
    // Includes grid, flex, variables, media queries and inline declarations.
    parseStyleAttributes: false,
    allowVulnerableTags: true,
    nonTextTags: ["script", "textarea", "option", "noscript", "title"],
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: {
          ...attributes,
          target: attributes.href?.startsWith("#") ? "_self" : "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  })
  const htmlAttributes = rootAttributes({
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    ...htmlElement?.attribs,
  })
  const bodyAttributes = rootAttributes(body?.attribs ?? {})
  return `<!DOCTYPE html><html ${htmlAttributes}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${escapeAttribute(CMS_LAYOUT_CSP)}"><title>${lang === "ar" ? "محتوى الصفحة" : "Page content"}</title><style>body{margin:0}img,video{max-width:100%;height:auto}</style></head><body ${bodyAttributes}>${clean}</body></html>`
}
