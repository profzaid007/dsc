"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { homePagesCollection } from "@/lib/pb-collections"
import pb from "@/lib/pb"
import type { HomePage } from "@/types/cms"
import { RichTextEditor } from "@/components/cms/RichTextEditor"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function CmsHomePageEditorPage() {
  const { isSuperAdmin } = useAuth()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [page, setPage] = useState<HomePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState("")
  const [slugValue, setSlugValue] = useState("")

  useEffect(() => {
    async function init() {
      let existingPage = await homePagesCollection.getBySlug(slug)

      if (!existingPage) {
        try {
          existingPage = await homePagesCollection.create({
            slug,
            title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
          })
        } catch {
          existingPage = await homePagesCollection.getBySlug(slug)
        }
      }

      setPage(existingPage)
      if (existingPage) {
        setTitle(existingPage.title)
        setSlugValue(existingPage.slug)
      }
      setLoading(false)
    }

    init()
  }, [slug])

  const handleSave = useCallback(
    async (html: string) => {
      if (!page) return
      setSaving(true)
      try {
        const updateData: Record<string, unknown> = { content: html }
        if (isSuperAdmin) {
          updateData.title = title
          updateData.slug = slugValue
        }
        if (Array.isArray(page.media)) {
          updateData.media = page.media
        }
        const updated = await homePagesCollection.update(page.id, updateData as Partial<HomePage>)
        setPage(updated)
        setTitle(updated.title)
        setSlugValue(updated.slug)
      } finally {
        setSaving(false)
      }
    },
    [page, title, slugValue, isSuperAdmin]
  )

  const togglePublish = useCallback(async () => {
    if (!page) return
    setPublishing(true)
    try {
      const updated = await homePagesCollection.update(page.id, {
        is_published: !page.is_published,
      })
      setPage(updated)
    } finally {
      setPublishing(false)
    }
  }, [page])

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      if (!page) throw new Error("No page loaded")
      const updated = await homePagesCollection.updateWithFiles(page.id, {}, [file])
      const newMedia = updated.media as string[]
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
      await homePagesCollection.delete(page.id)
      router.push("/cms/home-pages")
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
          href="/cms/home-pages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p>Page not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cms/home-pages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          {isSuperAdmin ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={slugValue}
                  onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="url-slug"
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{page.title}</h1>
              <p className="text-muted-foreground">/{page.slug}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-6">
          <div className="flex items-center gap-2">
            <Switch
              id="publish"
              checked={page.is_published}
              onCheckedChange={togglePublish}
              disabled={publishing}
            />
            <Label htmlFor="publish" className="font-medium">
              {page.is_published ? "Published" : "Draft"}
            </Label>
          </div>
        </div>
      </div>

      <RichTextEditor
        title="Content"
        initialContent={page.content}
        onSave={handleSave}
        isSaving={saving}
        onImageUpload={handleImageUpload}
      />

      <div className="flex items-center justify-between">
        {isSuperAdmin && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
