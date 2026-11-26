import type { Metadata } from "next"

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dsc.ac"

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "")

/** Build an absolute URL for a path such as "/blog/my-post". */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/** Collapse whitespace and shorten text, appending an ellipsis if needed. */
export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 3).trimEnd()}...`
}

/**
 * Produce a meta description (max 160 chars) from CMS text, falling back to
 * the provided default when the text is missing or empty.
 */
export function metaDescription(
  text: string | null | undefined,
  fallback: string
): string {
  const clean = text?.replace(/\s+/g, " ").trim()
  return clean ? truncate(clean, 160) : fallback
}

export const SITE_NAME = "Development Secrets Consultancy (DSC)"

export async function buildMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Promise<Metadata> {
  const { getPageTitle } = await import("@/lib/page-seo")
  const pageTitle = await getPageTitle(path, title)
  const url = absoluteUrl(path)
  return {
    title: { absolute: pageTitle },
    description,
    // Path-specific canonical and language alternates are supplied by the root layout.
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
  }
}

