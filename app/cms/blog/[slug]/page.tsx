"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { blogPagesCollection, blogCategoriesCollection } from "@/lib/pb-collections"
import { BlogPage } from "@/types/cms"
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
import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"
import pb from "@/lib/pb"

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

  const [page, setPage] = useState<BlogPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [postSlug, setPostSlug] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [authorName, setAuthorName] = useState("")

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  )

  const [resetTrigger, setResetTrigger] = useState(0)

  const isInitialMount = useRef(true)

  useEffect(() => {
    async function load() {
      const [data, cats] = await Promise.all([
        blogPagesCollection.getBySlug(slug),
        blogCategoriesCollection.getAll(),
      ])
      if (!data) {
        setLoading(false)
        return
      }
      setPage(data)
      setTitle(data.title)
      setPostSlug(data.slug)
      setCategory(data.category)
      setContent(data.content)
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
    setPostSlug(slugify(title))
  }, [title])

  const handleSave = useCallback(
    async (overrideContent?: string) => {
      if (!page) return
      setSaving(true)
      try {
        const updated = await blogPagesCollection.update(page.id, {
          title,
          slug: postSlug,
          category,
          author_name: authorName,
          content: overrideContent !== undefined ? overrideContent : content,
        })
        setPage(updated)
        setContent(updated.content)
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
    [page, title, postSlug, category, authorName, content, slug, router]
  )

  const handleContentSave = useCallback(
    async (html: string) => {
      setContent(html)
      await handleSave(html)
    },
    [handleSave]
  )

  const handleDiscard = useCallback(() => {
    if (!page) return
    setTitle(page.title)
    setPostSlug(page.slug)
    setCategory(page.category)
    setContent(page.content)
    setIsPublished(page.is_published)
    setAuthorName(page.author_name)
    setResetTrigger(t => t + 1)
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

  const handleDelete = useCallback(async () => {
    if (!page) return
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return
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
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={postSlug}
            readOnly
            placeholder="url-slug"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name} className="capitalize">
                  {cat.name}
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
        />
      </div>
      </Card>

      <RichTextEditor
        title="Content"
        initialContent={content}
        onSave={handleContentSave}
        isSaving={saving}
        onImageUpload={handleImageUpload}
        onDiscard={handleDiscard}
        resetTrigger={resetTrigger}
      />

    </div>
  )
}
