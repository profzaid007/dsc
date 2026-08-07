"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { blogPagesCollection, blogCategoriesCollection } from "@/lib/pb-collections"
import { BlogPage, BlogCategory } from "@/types/cms"
import type { Lang } from "@/types/form"
import { RichTextEditor } from "@/components/cms/RichTextEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft, Trash2, Copy } from "lucide-react"
import pb from "@/lib/pb"

function extractThumbnail(record: Record<string, unknown>): string {
  const t = record.thumbnail
  if (!t) return ""
  if (Array.isArray(t)) return t[0] || ""
  return t as string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function CmsBlogEditorPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [activeLang, setActiveLang] = useState<Lang>("en")

  const [page, setPage] = useState<BlogPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [enTitle, setEnTitle] = useState("")
  const [arTitle, setArTitle] = useState("")
  const [postSlug, setPostSlug] = useState("")
  const [category, setCategory] = useState("")
  const [enContent, setEnContent] = useState("")
  const [arContent, setArContent] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [authorName, setAuthorName] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)

  const [categories, setCategories] = useState<BlogCategory[]>([])

  const [resetKey, setResetKey] = useState(0)

  const isInitialMount = useRef(true)
  const pageRecordRef = useRef<Record<string, unknown> | null>(null)

  useEffect(() => {
    async function load() {
      const [rawRecords, cats] = await Promise.all([
        pb.collection("blog_pages").getFullList({ filter: `slug = "${slug}"`, limit: 1 }),
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
        category: rawRecord.category as string,
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
      setEnTitle(data.title_en)
      setArTitle(data.title_ar || "")
      setPostSlug(data.slug)
      setCategory(data.category)
      setEnContent(data.content_en)
      setArContent(data.content_ar || "")
      setIsPublished(data.is_published)
      setAuthorName(data.author_name)
      setCategories(cats)
      setLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    // Auto-generate slug from English title
    setPostSlug(slugify(enTitle))
  }, [enTitle])

  const handleSave = useCallback(
    async (overrideContent?: string) => {
      if (!page) return
      setSaving(true)
      try {
        const contentField = `content_${activeLang}` as const
        const contentValue = overrideContent !== undefined
          ? overrideContent
          : (activeLang === "en" ? enContent : arContent)
        const updated = await blogPagesCollection.update(page.id, {
          title_en: enTitle,
          title_ar: arTitle,
          slug: postSlug,
          category,
          author_name: authorName,
          [contentField]: contentValue,
        })
        setPage(updated)
        setEnTitle(updated.title_en)
        setArTitle(updated.title_ar || "")
        setEnContent(updated.content_en)
        setArContent(updated.content_ar || "")
        // If slug changed, redirect to new slug
        if (updated.slug !== slug) {
          router.push(`/cms/blog/${updated.slug}`)
        }
      } catch {
        alert("Failed to save. Make sure the slug is unique.")
      } finally {
        setSaving(false)
      }
    },
    [page, enTitle, arTitle, postSlug, category, authorName, enContent, arContent, slug, router, activeLang]
  )

  const handleContentChange = useCallback(
    (html: string) => {
      if (activeLang === "en") {
        setEnContent(html)
      } else {
        setArContent(html)
      }
    },
    [activeLang]
  )

  const handleContentSave = useCallback(
    async (html: string) => {
      if (activeLang === "en") {
        setEnContent(html)
      } else {
        setArContent(html)
      }
      await handleSave(html)
    },
    [handleSave, activeLang]
  )

  const copyFromEnglish = useCallback(() => {
    setArTitle(enTitle)
    setArContent(enContent)
    setResetKey(t => t + 1)
  }, [enTitle, enContent])

  const handleDiscard = useCallback(() => {
    if (!page) return
    setEnTitle(page.title_en)
    setArTitle(page.title_ar || "")
    setPostSlug(page.slug)
    setCategory(page.category)
    setEnContent(page.content_en)
    setArContent(page.content_ar || "")
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
      } catch {
        alert("Failed to upload thumbnail.")
      } finally {
        setUploadingThumbnail(false)
      }
    },
    [page]
  )

  const handleRemoveThumbnail = useCallback(async () => {
    if (!page) return
    try {
      const updated = await blogPagesCollection.removeThumbnail(page.id)
      setPage(updated)
      pageRecordRef.current = updated as unknown as Record<string, unknown>
      setThumbnailUrl(null)
    } catch {
      alert("Failed to remove thumbnail.")
    }
  }, [page])

  const handleDelete = useCallback(async () => {
    if (!page) return
    if (!confirm(`Delete "${page.title_en}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await blogPagesCollection.delete(page.id)
      router.push("/cms/blog")
    } catch {
      setDeleting(false)
    }
  }, [page, router])

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
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p>Post not found.</p>
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
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">Manage blog post details</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="publish"
              checked={isPublished}
              onCheckedChange={togglePublish}
              disabled={publishing}
            />
            <Label htmlFor="publish" className="font-medium">
              {isPublished ? "Published" : "Draft"}
            </Label>
          </div>
        </div>
      </div>

      <Card className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="w-72">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)] min-w-[160px]">
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.key}>
                  {activeLang === "ar" && cat.label_ar ? cat.label_ar : cat.label_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Author name"
            className="max-w-xs w-72"
          />
        </div>

        <div className="space-y-2">
          <Label>Thumbnail</Label>
          {thumbnailUrl && (
            <div className="relative mb-2 w-48 overflow-hidden rounded-lg border">
              <Image
                src={thumbnailUrl}
                alt="Thumbnail"
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

      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Lang)}>
        <TabsList>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="ar">Arabic</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeLang === "en" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="en-title">Title (English)</Label>
            <Input
              id="en-title"
              value={enTitle}
              onChange={(e) => setEnTitle(e.target.value)}
              placeholder="Post title"
            />
          </div>
          <RichTextEditor
            key={`${resetKey}-en`}
            title="English Content"
            initialContent={enContent}
            onSave={handleContentSave}
            isSaving={saving}
            onImageUpload={handleImageUpload}
            onDiscard={handleDiscard}
            onChange={handleContentChange}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ar-title">Title (Arabic)</Label>
            <Button variant="outline" size="sm" onClick={copyFromEnglish}>
              <Copy className="mr-2 h-4 w-4" />
              Copy from English
            </Button>
          </div>
          <Input
            id="ar-title"
            value={arTitle}
            onChange={(e) => setArTitle(e.target.value)}
            placeholder="عنوان المقال"
          />
          <RichTextEditor
            key={`${resetKey}-ar`}
            title="Arabic Content"
            initialContent={arContent}
            onSave={handleContentSave}
            isSaving={saving}
            onImageUpload={handleImageUpload}
            onDiscard={handleDiscard}
            onChange={handleContentChange}
            direction="rtl"
          />
        </div>
      )}
    </div>
  )
}
