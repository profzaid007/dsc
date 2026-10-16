import type { MetadataRoute } from "next"
import type { RecordModel } from "pocketbase"
import { boundedFullList } from "@/lib/bounded-records"
import pb from "@/lib/pb"
import { absoluteUrl } from "@/lib/seo"

/**
 * Revalidate periodically: CMS content (blog posts, info pages, events) is
 * edited in PocketBase without a redeploy, so the prerendered sitemap must be
 * refreshed on its own.
 */
export const revalidate = 3600

/**
 * Public routes that are static files in app/, i.e. they exist without any
 * PocketBase content behind them.
 */
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: absoluteUrl("/programmes"), changeFrequency: "daily", priority: 0.9 },
  {
    url: absoluteUrl("/programmes/public_lectures"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/programmes/training_programmes"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  { url: absoluteUrl("/blog"), changeFrequency: "daily", priority: 0.8 },
  { url: absoluteUrl("/contact-us"), changeFrequency: "yearly", priority: 0.6 },
  { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.2 },
  { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
]

/**
 * Fetch from PocketBase without failing the whole sitemap: if the backend is
 * unreachable at build time we simply omit those URLs and keep the static ones.
 */
async function safeList(
  collection: string,
  options: { filter?: string; sort?: string } = {}
): Promise<RecordModel[]> {
  try {
    return await boundedFullList(pb.collection(collection), options)
  } catch {
    return []
  }
}

function toLastModified(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, cmsPages, infoPages, portals, lectures, programmes] =
    await Promise.all([
      safeList("blog_pages", {
        filter: "is_published = true",
        sort: "-updated",
      }),
      safeList("home_pages", { filter: "is_published = true", sort: "-updated" }),
      safeList("info_pages", { filter: "is_published = true", sort: "order" }),
      safeList("portals", { filter: "is_deleted = false", sort: "order" }),
      safeList("public_lectures_public", { sort: "-created" }),
      safeList("programs", {
        filter: 'status = "published" || status = "in_progress" || status = "completed"',
        sort: "-created",
      }),
    ])

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: toLastModified(post.updated),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  // Slugs that collide with a real route in app/ would duplicate a URL
  // (e.g. a CMS page slugged "contact-us" next to app/contact-us/page.tsx).
  const staticPaths = new Set(STATIC_ROUTES.map((entry) => entry.url))

  // CMS-managed pages rendered by app/[slug]/page.tsx (e.g. about-us).
  const cmsEntries: MetadataRoute.Sitemap = cmsPages
    .filter((page) => !staticPaths.has(absoluteUrl(`/${page.slug}`)))
    .map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: toLastModified(page.updated),
      changeFrequency: "monthly",
      priority: 0.6,
    }))

  // Info pages rendered by app/info/[id]/page.tsx (the segment is the slug).
  const infoEntries: MetadataRoute.Sitemap = infoPages.map((page) => ({
    url: absoluteUrl(`/info/${page.slug}`),
    lastModified: toLastModified(page.updated),
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  const portalEntries: MetadataRoute.Sitemap = portals.map((portal) => ({
    url: absoluteUrl(`/portal/${portal.portal_key}`),
    lastModified: toLastModified(portal.updated),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const lectureEntries: MetadataRoute.Sitemap = lectures.map((lecture) => ({
    url: absoluteUrl(`/programmes/public_lectures/${lecture.id}`),
    lastModified: toLastModified(lecture.updated),
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  const programmeEntries: MetadataRoute.Sitemap = programmes.map((programme) => ({
    url: absoluteUrl(`/programmes/training_programmes/${programme.id}`),
    lastModified: toLastModified(programme.updated),
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [
    ...STATIC_ROUTES,
    ...blogEntries,
    ...cmsEntries,
    ...infoEntries,
    ...portalEntries,
    ...lectureEntries,
    ...programmeEntries,
  ]
}
