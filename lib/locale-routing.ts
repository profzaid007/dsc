import type { Lang } from "@/types/form"

export function pathLanguage(path: string): Lang | undefined {
  return /^\/(ar|en)(?=\/|$)/.exec(path)?.[1] as Lang | undefined
}

export function stripLocale(path: string): string {
  return path.replace(/^\/(ar|en)(?=\/|$)/, "") || "/"
}

export function localizedPath(path: string, lang: Lang): string {
  const bare = stripLocale(path)
  return `/${lang}${bare === "/" ? "" : bare}`
}

export function isArticlePath(path: string): boolean {
  return /^\/blog\/[^/]+\/?$/.test(path)
}

export function isPublicPath(path: string): boolean {
  return !/^\/(api|_next|dashboard|cms|login|register|reset-password|forgot-password|config-preview|_not-found)(?:\/|$)/.test(path)
    && !/\.[a-z0-9]+$/i.test(path)
}
