import { blogField, blogContentLang, publicBlogField } from "@/lib/blog-content"
import { boundedFullList } from "@/lib/bounded-records"
import Image from "next/image"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import pb from "@/lib/pb"
import { t } from "@/lib/i18n"
import { formatDate } from "@/lib/format-date"
import type { BlogPage, BlogCategory } from "@/types/cms"
import type { Lang } from "@/types/form"
import "suneditor/css/contents"

import { isCustomCmsLayout } from "@/lib/cms-layout"
import { CmsContent } from "@/components/cms/CmsContent"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const lang: Lang = cookieStore.get("lang")?.value === "ar" ? "ar" : "en"

  let page: BlogPage | null = null
  let thumbnailUrl: string | null = null
  let categoryLabel = ""

  try {
    const [catRecords, record] = await Promise.all([
      boundedFullList(pb.collection("blog_categories")),
      pb
        .collection("blog_pages")
        .getFirstListItem(pb.filter("slug = {:value0} && is_published = true", { value0: slug })),
    ])
    const catMap = new Map<string, BlogCategory>()
    for (const c of catRecords) {
      catMap.set(c.key as string, {
        id: c.id as string,
        key: c.key as string,
        label_en: c.label_en as string,
        label_ar: c.label_ar as string | undefined,
      })
    }
    const rawCategory = record.category as string
    const matched = catMap.get(rawCategory)
    categoryLabel = matched
      ? lang === "ar" && matched.label_ar
        ? matched.label_ar
        : matched.label_en
      : rawCategory
    const thumbnail = Array.isArray(record.thumbnail)
      ? record.thumbnail[0]
      : record.thumbnail
    thumbnailUrl = thumbnail ? pb.files.getURL(record, thumbnail) : null
    page = {
      id: record.id as string,
      slug: record.slug as string,
      title: publicBlogField(record, "title", lang),
      main_category: record.main_category || "",
      category: rawCategory,
      keywords: record.keywords !== undefined ? String(record.keywords || "") : rawCategory,
      content: publicBlogField(record, "content", lang),
      is_published: record.is_published as boolean,
      media: (record.media as string[]) || [],
      thumbnail: thumbnail || "",
      author_name: (record.author_name as string) || "",
      created: record.created as string,
      updated: record.updated as string,
    }
  } catch {
    // Record not found or not published
  }

  if (!page) {
    notFound()
  }

  const content = blogField(page, "content")
  const customLayout = isCustomCmsLayout(content)

  return (
    <div className={customLayout ? "w-full min-w-0 py-12 lg:px-8" : "mx-auto w-full min-w-0 max-w-4xl px-3 py-12 sm:px-6 lg:max-w-none lg:px-8"}>
      <div className={customLayout ? "mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-6 lg:max-w-none lg:px-0" : undefined}>
      <Link
        href="/blog"
        className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; {t({ en: "Blog", ar: "المدونة" }, lang)}
      </Link>

      <div className="mb-8 space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground [overflow-wrap:anywhere]">
          <span className="rounded-md bg-gray-100 px-2 py-0.5 capitalize">
            {categoryLabel}
          </span>
          <span>&middot;</span>
          <span>{formatDate(page.created)}</span>
          {page.author_name && (
            <>
              <span>&middot;</span>
              <span>
                {t({ en: "By", ar: "بقلم" }, lang)} {page.author_name}
              </span>
            </>
          )}
        </div>
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={blogField(page, "title")}
            width={864}
            height={486}
            className="mx-auto max-h-96 w-auto max-w-full rounded-lg object-contain"
          />
        )}
        <h1 dir="auto" className="text-3xl font-bold [overflow-wrap:anywhere]">
          {blogField(page, "title")}
        </h1>
      </div>

      </div>
      <CmsContent
        html={content}
        lang={blogContentLang(content)}
        className={customLayout ? undefined : "w-full min-w-0 !p-0 [overflow-wrap:anywhere] [&_ol]:!ps-5 [&_ol]:!pe-0 [&_ul]:!ps-5 [&_ul]:!pe-0"}
      />
    </div>
  )
}
