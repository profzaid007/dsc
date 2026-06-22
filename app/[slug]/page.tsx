import Link from "next/link"
import { cookies } from "next/headers"
import pb from "@/lib/pb"
import { localizedField } from "@/lib/i18n"
import type { HomePage } from "@/types/cms"
import type { Lang } from "@/types/form"
import "suneditor/css/contents"

import { sanitizeCmsContent } from "@/lib/sanitize"

interface SlugPageProps {
  params: Promise<{ slug: string }>
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value as Lang) || "en"

  let page: HomePage | null = null

  try {
    const record = await pb
      .collection("home_pages")
      .getFirstListItem(`slug = "${slug}" && is_published = true`)
    page = record as unknown as HomePage
  } catch {
    // Page not found or not published
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          &larr; Home
        </Link>
        <h1 className="mb-4 text-3xl font-bold capitalize">{slug.replace(/-/g, " ")}</h1>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg text-muted-foreground">Page not found.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This page does not exist or is not published yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; Home
      </Link>

      <h1 className="mb-8 text-3xl font-bold capitalize">
        {localizedField(page, lang, "title")}
      </h1>

      <div
        className="cms-rendered sun-editor-editable space-y-4 text-gray-700 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-3 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsContent(localizedField(page, lang, "content")) }}
      />
    </div>
  )
}
