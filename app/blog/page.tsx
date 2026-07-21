import Link from "next/link"
import Image from "next/image"
import { cookies } from "next/headers"
import pb from "@/lib/pb"
import { localizedField, t } from "@/lib/i18n"
import type { BlogPage } from "@/types/cms"
import type { Lang } from "@/types/form"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function extractThumbnail(record: unknown): string {
  const t = (record as Record<string, unknown>).thumbnail
  if (!t) return ""
  if (Array.isArray(t)) return t[0] || ""
  return t as string
}

export default async function BlogPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value as Lang) || "en"

  let posts: BlogPage[] = []
  let thumbnailUrls: (string | null)[] = []

  try {
    const records = await pb
      .collection("blog_pages")
      .getFullList({
        filter: "is_published = true",
        sort: "-created",
      })
    posts = records.map((record) => {
      const thumbFilename = extractThumbnail(record)
      thumbnailUrls.push(thumbFilename ? pb.files.getUrl(record, thumbFilename) : null)
      return {
        id: record.id as string,
        slug: record.slug as string,
        title_en: record.title_en as string,
        title_ar: record.title_ar as string | undefined,
        category: record.category as string,
        content_en: record.content_en as string,
        content_ar: record.content_ar as string | undefined,
        is_published: record.is_published as boolean,
        media: (record.media as string[]) || [],
        thumbnail: thumbFilename,
        author_name: (record.author_name as string) || "",
        created: record.created as string,
        updated: record.updated as string,
      }
    })
  } catch {
    // Error fetching posts
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">{t({ en: "Blog", ar: "المدونة" }, lang)}</h1>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg text-muted-foreground">No posts yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back later for new articles.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group flex flex-row gap-5 p-4 mb-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                {thumbnailUrls[i] && (
                  <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={thumbnailUrls[i]!}
                      alt={localizedField(post, lang, "title")}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="capitalize">
                      {post.category}
                    </Badge>
                    <span>
                      {new Date(post.created).toLocaleDateString()}
                    </span>
                    {post.author_name && (
                      <>
                        <span>&middot;</span>
                        <span>By {post.author_name}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold group-hover:underline">
                    {localizedField(post, lang, "title")}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {localizedField(post, lang, "content").replace(/<[^>]*>/g, "").slice(0, 200)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
