import sanitizeHtml from "sanitize-html"

export const GOOGLE_DRIVE_VIDEO_URL =
  /^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/(?:view|preview)\/?(?:[?#][^\s]*)?$/

export function sanitizeCmsContent(html: string, lang?: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "figure",
      "figcaption",
      "iframe",
      "video",
      "source",
    ],
    allowedAttributes: {
      "*": ["class", "dir", "style"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "allowfullscreen", "title"],
      video: ["src", "controls", "poster", "width", "height", "preload", "playsinline"],
      source: ["src", "type"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
      "drive.google.com",
    ],
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
        color: [/^#[0-9a-f]{3,8}$/i, /^[a-z]+$/i],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^[a-z]+$/i],
        "font-family": [/^[\p{L}\p{N}\s,'"_-]+$/u],
        "font-size": [/^\d+(px|em|rem|%)$/],
        "font-weight": [/^(normal|bold|[1-9]00)$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
    },
    exclusiveFilter: ({ tag, attribs }) => {
      if (tag !== "iframe" || !attribs.src || !URL.canParse(attribs.src)) return false
      return new URL(attribs.src).hostname === "drive.google.com" &&
        !/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/preview$/.test(attribs.src)
    },
  })
  return lang === "ar"
    ? clean
        .replace(/dir="ltr"/gi, "")
        .replace(/text-align:\s*left/gi, "text-align:right")
    : clean
}
