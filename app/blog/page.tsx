import { boundedFullList } from "@/lib/bounded-records"
import pb from "@/lib/pb"
import type { BlogPage as BlogPost, BlogCategory } from "@/types/cms"
import { BlogListing, type ListingPost } from "./BlogListing"

export default async function BlogPage() {
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
        title: record.title || "",
        main_category: record.main_category || "",
        category: record.category || "",
        keywords: record.keywords !== undefined ? String(record.keywords || "") : String(record.category || ""),
        content: record.content || "",
        is_published: record.is_published,
        media: record.media || [],
        thumbnail: thumbnail || "",
        author_name: record.author_name || "",
        created: record.created,
        updated: record.updated,
        thumbnailUrl: thumbnail ? pb.files.getUrl(record, thumbnail) : null,
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
