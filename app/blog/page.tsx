import Link from "next/link"
import pb from "@/lib/pb"
import type { BlogPage } from "@/types/cms"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const revalidate = 60

export default async function BlogPage() {
  let posts: BlogPage[] = []

  try {
    const records = await pb
      .collection("blog_pages")
      .getFullList({
        filter: "is_published = true",
        sort: "-created",
      })
    posts = records.map((record) => {
      return {
        id: record.id as string,
        slug: record.slug as string,
        title: record.title as string,
        category: record.category as string,
        content: record.content as string,
        is_published: record.is_published as boolean,
        media: (record.media as string[]) || [],
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
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg text-muted-foreground">No posts yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back later for new articles.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group flex flex-col gap-5 p-4 mb-4 transition-all hover:shadow-md hover:-translate-y-0.5">
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
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content.replace(/<[^>]*>/g, "").slice(0, 200)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
