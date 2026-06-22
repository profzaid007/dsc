import Link from "next/link"
import pb from "@/lib/pb"
import type { BlogPage } from "@/types/cms"
import "suneditor/css/contents"

import { sanitizeCmsContent } from "@/lib/sanitize"

export const revalidate = 60

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { slug } = await params

  let page: BlogPage | null = null

  try {
    const record = await pb
      .collection("blog_pages")
      .getFirstListItem(`slug = "${slug}" && is_published = true`)
    page = {
      id: record.id as string,
      slug: record.slug as string,
      title_en: record.title_en as string,
      category: record.category as string,
        content_en: record.content_en as string,
      is_published: record.is_published as boolean,
      media: (record.media as string[]) || [],
      author_name: (record.author_name as string) || "",
      created: record.created as string,
      updated: record.updated as string,
    }
  } catch {
    // Record not found or not published
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/blog"
          className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          &larr; Back
        </Link>
        <h1 className="mb-4 text-3xl font-bold">Not found</h1>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg text-muted-foreground">
            This post does not exist or is not published yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/blog"
        className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; Blog
      </Link>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-md bg-gray-100 px-2 py-0.5 capitalize">
            {page.category}
          </span>
          <span>&middot;</span>
          <span>{new Date(page.created).toLocaleDateString()}</span>
          {page.author_name && (
            <>
              <span>&middot;</span>
              <span>By {page.author_name}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold">{page.title_en}</h1>
      </div>

      <div
        className="cms-rendered sun-editor-editable space-y-4 text-gray-700 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-3 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsContent(page.content_en) }}
      />
    </div>
  )
}
