import { boundedFullList } from "@/lib/bounded-records"
import { publicBlogField } from "@/lib/blog-content"
import { cookies } from "next/headers"
import pb from "@/lib/pb"
import type { BlogPage as BlogPost, BlogCategory } from "@/types/cms"
import { BlogListing, type ListingPost } from "./BlogListing"

export default async function BlogPage() {
  const lang = (await cookies()).get("lang")?.value === "ar" ? "ar" : "en"
  let posts: ListingPost[] = []
  let categories: BlogCategory[] = []
  let fetchFailed = false
  try {
    const [catRecords, records] = await Promise.all([
      boundedFullList(pb.collection("blog_categories")),
      boundedFullList(pb
        .collection("blog_pages"), { filter: "is_published = true", sort: "-created" }),
    ])
    categories = catRecords.map((record) => ({
      id: record.id,
      main_category: record.main_category || "",
      key: record.key,
      label_en: record.label_en,
      label_ar: record.label_ar,
    }))
    posts = records.map((record) => {
      const thumbnail = Array.isArray(record.thumbnail)
        ? record.thumbnail[0]
        : record.thumbnail
      return {
        id: record.id,
        slug: record.slug,
        title: publicBlogField(record, "title", lang),
        main_category: record.main_category || "",
        category: record.category || "",
        keywords: record.keywords !== undefined ? String(record.keywords || "") : String(record.category || ""),
        content: publicBlogField(record, "content", lang),
        is_published: record.is_published,
        media: record.media || [],
        thumbnail: thumbnail || "",
        author_name: record.author_name || "",
        created: record.created,
        updated: record.updated,
        thumbnailUrl: thumbnail ? pb.files.getURL(record, thumbnail) : null,
      } satisfies BlogPost & { thumbnailUrl: string | null }
    })
  } catch {
    fetchFailed = true
  }
  return (
    <BlogListing
      posts={posts}
      categories={categories}
      fetchFailed={fetchFailed}
    />
  )
}
