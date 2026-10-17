"use client"
import { ClassificationFields } from "@/components/form/ClassificationFields"
import { classificationParent, mainCategoryKey } from "@/lib/classification"
import { blogField, blogContentLang, blogContentPayload } from "@/lib/blog-content"


import { boundedFullList } from "@/lib/bounded-records"
import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { blogPagesCollection, blogCategoriesCollection } from "@/lib/pb-collections"
import { BlogPage, BlogCategory } from "@/types/cms"
import { RichTextEditor } from "@/components/cms/RichTextEditor"
import { CmsPreviewDialog } from "@/components/cms/CmsPreviewDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft, ArrowRight, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import pb, { getErrorMessage } from "@/lib/pb"
import { t, UI_STRINGS } from "@/lib/i18n"
import { formatDate } from "@/lib/format-date"
import { useLang } from "@/lib/lang-context"

function extractThumbnail(record: Record<string, unknown>): string {
  const t = record.thumbnail
  if (!t) return ""
  if (Array.isArray(t)) return t[0] || ""
  return t as string
}

export default function CmsBlogEditorPage() {

  const { lang } = useLang()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft

  const [page, setPage] = useState<BlogPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [enTitle, setEnTitle] = useState("")
  const [postSlug, setPostSlug] = useState("")
  const [category, setCategory] = useState("")
  const [keywords, setKeywords] = useState("")
  const [mainCategory, setMainCategory] = useState("")
  const [enContent, setEnContent] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [authorName, setAuthorName] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)

  const [categories, setCategories] = useState<BlogCategory[]>([])

  const [resetKey, setResetKey] = useState(0)

  const pageRecordRef = useRef<Record<string, unknown> | null>(null)

  useEffect(() => {
    async function load() {
      const [rawRecords, cats] = await Promise.all([
        boundedFullList(pb.collection("blog_pages"), { filter: pb.filter("slug = {:value0}", { value0: slug }), limit: 1 }),
        blogCategoriesCollection.getAll(),
      ])
      const rawRecord = rawRecords[0] as Record<string, unknown> | undefined
      if (!rawRecord) {
        setLoading(false)
        return
      }
      pageRecordRef.current = rawRecord

      const thumbFile = extractThumbnail(rawRecord)
      setThumbnailUrl(thumbFile ? pb.files.getUrl(rawRecord, thumbFile) : null)

      const data: BlogPage = {
        id: rawRecord.id as string,
        slug: rawRecord.slug as string,
        title_en: rawRecord.title_en as string,
        title_ar: rawRecord.title_ar as string | undefined,
        main_category: mainCategoryKey(String(rawRecord.main_category || cats.find(c => c.key === rawRecord.category)?.main_category || classificationParent(String(rawRecord.category || "")))),
        category: rawRecord.category as string,
        keywords: rawRecord.keywords !== undefined ? String(rawRecord.keywords || "") : (cats.find(c => c.key === rawRecord.category)?.label_ar || cats.find(c => c.key === rawRecord.category)?.label_en || String(rawRecord.category || "")),
        content_en: rawRecord.content_en as string,
        content_ar: rawRecord.content_ar as string | undefined,
        is_published: rawRecord.is_published as boolean,
        media: (rawRecord.media as string[]) || [],
        thumbnail: thumbFile,
        author_name: (rawRecord.author_name as string) || "",
        created: rawRecord.created as string,
        updated: rawRecord.updated as string,
      }
      setPage(data)
      setEnTitle(blogField(data, "title"))
      setPostSlug(data.slug)
      setCategory(data.category)
      setKeywords(data.keywords || "")
      setMainCategory(data.main_category || classificationParent(data.category))
      setEnContent(blogField(data, "content"))
      setIsPublished(data.is_published)
      setAuthorName(data.author_name)
      setCategories(cats)
      setLoading(false)
    }
    load()
  }, [slug])

  const handleSave = useCallback(
    async (overrideContent?: string) => {
      if (!page) return
      if (!mainCategory) {
        toast.error(lang === "ar" ? "اختر التصنيف الرئيسي للمقال" : "Choose a main category for the article")
        return
      }
      setSaving(true)
      try {
        const contentValue = overrideContent ?? enContent
        const updated = await blogPagesCollection.update(page.id, {
          ...blogContentPayload(enTitle, contentValue),
          slug: postSlug,
          keywords,
          category: "",
          main_category: mainCategory,
          author_name: authorName,
        })
        setPage(updated)
        setMainCategory(updated.main_category || "")
        setKeywords(updated.keywords || "")
        setCategory(updated.category)
        setEnTitle(blogField(updated, "title"))
        setEnContent(blogField(updated, "content"))
        // If slug changed, redirect to new slug
        if (updated.slug !== slug) {
          router.push(`/cms/blog/${updated.slug}`)
        }
      } catch (err) {
        toast.error(
          t(
            { en: "Failed to save. Make sure the slug is unique.", ar: "فشل الحفظ. تأكد من أن المعرف (slug) فريد." },
            lang
          ),
          { description: getErrorMessage(err) }
        )
      } finally {
        setSaving(false)
      }
    },
    [page, enTitle, postSlug, category, keywords, mainCategory, authorName, enContent, slug, router, lang]
  )

  const handleContentSave = useCallback(async (html: string) => {
    setEnContent(html)
    await handleSave(html)
  }, [handleSave])

  const handleDiscard = useCallback(() => {
    if (!page) return
    setEnTitle(blogField(page, "title"))
    setPostSlug(page.slug)
    setCategory(page.category)
    setKeywords(page.keywords || "")
    setMainCategory(page.main_category || classificationParent(page.category))
    setEnContent(blogField(page, "content"))
    setIsPublished(page.is_published)
    setAuthorName(page.author_name)
    setThumbnailUrl(
      page.thumbnail && pageRecordRef.current
        ? pb.files.getUrl(pageRecordRef.current, page.thumbnail)
        : null
    )
    setResetKey(t => t + 1)
  }, [page])

  const togglePublish = useCallback(async () => {
    if (!page) return
    setPublishing(true)
    try {
      const updated = await blogPagesCollection.update(page.id, {
        is_published: !page.is_published,
      })
      setPage(updated)
      setIsPublished(updated.is_published)
    } finally {
      setPublishing(false)
    }
  }, [page])

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      if (!page) throw new Error("No page loaded")
      const updated = await blogPagesCollection.updateWithFiles(
        page.id,
        {},
        [file]
      )
      const newMedia = updated.media
      const filename = newMedia[newMedia.length - 1]
      setPage((prev) => (prev ? { ...prev, media: newMedia } : null))
      return pb.files.getUrl(updated, filename)
    },
    [page]
  )

  const handleThumbnailUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !page) return
      setUploadingThumbnail(true)
      try {
        const updated = await blogPagesCollection.updateThumbnail(page.id, file)
        setPage(updated)
        pageRecordRef.current = updated as unknown as Record<string, unknown>
        setThumbnailUrl(pb.files.getUrl(updated as never, updated.thumbnail))
      } catch (err) {
        toast.error(
          t(
            { en: "Failed to upload thumbnail.", ar: "فشل رفع الصورة المصغرة." },
            lang
          ),
          { description: getErrorMessage(err) }
        )
      } finally {
        setUploadingThumbnail(false)
      }
    },
    [page, lang]
  )

  const handleRemoveThumbnail = useCallback(async () => {
    if (!page) return
    try {
      const updated = await blogPagesCollection.removeThumbnail(page.id)
      setPage(updated)
      pageRecordRef.current = updated as unknown as Record<string, unknown>
      setThumbnailUrl(null)
    } catch (err) {
      toast.error(
        t(
          { en: "Failed to remove thumbnail.", ar: "فشل إزالة الصورة المصغرة." },
          lang
        ),
        { description: getErrorMessage(err) }
      )
    }
  }, [page, lang])

  const handleDelete = useCallback(async () => {
    if (!page) return
    if (
      !confirm(
        t(
          {
            en: `Delete "${page.title_en}"? This cannot be undone.`,
            ar: `حذف "${page.title_en}"؟ لا يمكن التراجع عن هذا.`,
          },
          lang
        )
      )
    )
      return
    setDeleting(true)
    try {
      await blogPagesCollection.delete(page.id)
      router.push("/cms/blog")
    } catch (err) {
      toast.error(getErrorMessage(err))
      setDeleting(false)
    }
  }, [page, router, lang])

  // Category label for the preview, resolved the same way the public
  // /blog/[slug] page resolves it.
  const previewCategoryLabel = (() => {
    const matched = categories.find((c) => c.key === category)
    if (!matched) return category
    return lang === "ar" && matched.label_ar ? matched.label_ar : matched.label_en
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="space-y-4">
        <Link
          href="/cms/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <BackIcon className="h-4 w-4" />
          {t({ en: "Back", ar: "رجوع" }, lang)}
        </Link>
        <p>{t({ en: "Post not found.", ar: "المنشور غير موجود." }, lang)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cms/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <BackIcon className="h-4 w-4" />
          {t({ en: "Back", ar: "رجوع" }, lang)}
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t({ en: "Edit Post", ar: "تعديل المنشور" }, lang)}
          </h1>
          <p className="text-muted-foreground">
            {t({ en: "Manage blog post details", ar: "إدارة تفاصيل منشور المدونة" }, lang)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="me-2 h-4 w-4" />
            {t(UI_STRINGS.preview, lang)}
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              id="publish"
              checked={isPublished}
              onCheckedChange={togglePublish}
              disabled={publishing}
            />
            <Label htmlFor="publish" className="font-medium">
              {isPublished ? t(UI_STRINGS.published, lang) : t(UI_STRINGS.draft, lang)}
            </Label>
          </div>
        </div>
      </div>

      <Card className="space-y-4 p-4">
        <ClassificationFields main={mainCategory} keywords={keywords} disabled={saving}
          onChange={(main, value) => { setMainCategory(main); setKeywords(value) }} />

        <div className="space-y-2">
          <Label htmlFor="author">
            {t({ en: "Author", ar: "المؤلف" }, lang)}
          </Label>
          <Input
            id="author"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={t({ en: "Author name", ar: "اسم المؤلف" }, lang)}
            className="max-w-xs w-72"
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ en: "Thumbnail", ar: "الصورة المصغرة" }, lang)}</Label>
          {thumbnailUrl && (
            <div className="relative mb-2 w-48 overflow-hidden rounded-lg border">
              <Image
                src={thumbnailUrl}
                alt={t({ en: "Thumbnail", ar: "الصورة المصغرة" }, lang)}
                width={192}
                height={108}
                className="h-auto w-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute right-1 top-1"
                onClick={handleRemoveThumbnail}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={uploadingThumbnail}
              className="w-72"
            />
            {uploadingThumbnail && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="post-title">{t({ en: "Title", ar: "العنوان" }, lang)}</Label>
          <Input id="post-title" dir="auto" value={enTitle} disabled={saving}
            onChange={(e) => setEnTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-slug">{t({ en: "URL slug", ar: "معرف الرابط" }, lang)}</Label>
          <Input fieldWidth="medium" id="post-slug" dir="auto" value={postSlug} disabled={saving}
            onChange={(e) => setPostSlug(e.target.value)} />
        </div>
        <RichTextEditor key={resetKey}
          title={t({ en: "Content", ar: "المحتوى" }, lang)}
          initialContent={enContent} onSave={handleContentSave} isSaving={saving}
          onImageUpload={handleImageUpload} maxMediaSizeMB={50} onDiscard={handleDiscard}
          onChange={setEnContent}
          direction={blogContentLang(enContent || enTitle) === "ar" ? "rtl" : "ltr"} />
      </div>

      <CmsPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={enTitle}
        html={enContent}
        lang={blogContentLang(enContent || enTitle)}
        path={`/blog/${postSlug}`}
      >
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {previewCategoryLabel && (
              <>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 capitalize">
                  {previewCategoryLabel}
                </span>
                <span>&middot;</span>
              </>
            )}
            {page.created && <span>{formatDate(page.created)}</span>}
            {authorName && (
              <>
                <span>&middot;</span>
                <span>
                  {t({ en: "By", ar: "بقلم" }, lang)} {authorName}
                </span>
              </>
            )}
          </div>
        </div>
      </CmsPreviewDialog>
    </div>
  )
}
