import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import PocketBase from "pocketbase"
import { PAGE_TITLE_MAP, formatPageTitle, recordPageTitle } from "@/lib/page-titles"
import { publicBlogField } from "@/lib/blog-content"

export const getPageTitle = cache(async (path: string, fallback?: string) => {
  const lang = (await cookies()).get("lang")?.value === "ar" ? "ar" : "en"
  const client = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090")
  const find = async (collection: string, filter: string) => {
    try { return await client.collection(collection).getFirstListItem(filter, { signal: AbortSignal.timeout(5000), requestKey: null }) }
    catch { return null }
  }
  const override = await find("page_seo", client.filter("path = {:path}", { path }))
  const authored = override?.[`title_${lang}`]
  if (typeof authored === "string" && authored.trim()) return formatPageTitle(authored)
  if (PAGE_TITLE_MAP[path]) return formatPageTitle(PAGE_TITLE_MAP[path][lang])
  const parts = path.split("/").filter(Boolean)
  const collection = parts[0] === "portal" ? "portals" : parts[0] === "info" ? "info_pages" : parts[0] === "blog" ? "blog_pages" : path.startsWith("/programmes/training_programmes/") ? "programs" : path.startsWith("/programmes/public_lectures/") ? "public_lectures_public" : parts.length === 1 ? "home_pages" : ""
  if (collection) {
    const key = collection === "portals" ? "portal_key" : ["programs", "public_lectures_public"].includes(collection) ? "id" : "slug"
    const published = collection === "portals" ? " && is_deleted = false" : ["home_pages", "info_pages", "blog_pages"].includes(collection) ? " && is_published = true" : ""
    const record = await find(collection, client.filter(`${key} = {:slug}${published}`, { slug: parts.at(-1) }))
    if (record) {
      const title = collection === "blog_pages" ? publicBlogField(record, "title", lang) : recordPageTitle(record, lang)
      if (title.trim()) return formatPageTitle(title)
    }
  }
  return formatPageTitle(fallback || parts.at(-1)?.replace(/-/g, " ") || (lang === "ar" ? "استشارية أسرار التطور" : "Development Secrets Consultancy"))
})
