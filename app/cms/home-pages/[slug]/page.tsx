"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { homePagesCollection } from "@/lib/pb-collections"
import pb from "@/lib/pb"
import type { HomePage } from "@/types/cms"
import type { Lang } from "@/types/form"
import { RichTextEditor } from "@/components/cms/RichTextEditor"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function CmsHomePageEditorPage() {
  const { isSuperAdmin } = useAuth()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [activeLang, setActiveLang] = useState<Lang>("en")

  const [page, setPage] = useState<HomePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [enTitle, setEnTitle] = useState("")
  const [arTitle, setArTitle] = useState("")
  const [slugValue, setSlugValue] = useState("")
  const [resetKey, setResetKey] = useState(0)

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
        setEnTitle(existingPage.title_en)
        setArTitle(existingPage.title_ar || "")
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
        const contentField = `content_${activeLang}` as const
        const updateData: Record<string, unknown> = { [contentField]: html }
        if (isSuperAdmin) {
          updateData.title_en = enTitle
          updateData.title_ar = arTitle
          updateData.slug = slugValue
        }
        if (Array.isArray(page.media)) {
          updateData.media = page.media
        }
        const updated = await homePagesCollection.update(page.id, updateData as Partial<HomePage>)
        setPage(updated)
        setEnTitle(updated.title_en)
        setArTitle(updated.title_ar || "")
        setSlugValue(updated.slug)
      } finally {
        setSaving(false)
      }
    },
    [page, enTitle, arTitle, slugValue, isSuperAdmin, activeLang]
  )

  const handleDiscard = useCallback(async () => {
    if (!page) return
    const original = await homePagesCollection.getBySlug(slug)

    if (original) {
      setPage(original)
      setEnTitle(original.title_en)
      setArTitle(original.title_ar || "")
      setSlugValue(original.slug)
    }

    setResetKey(t => t + 1)
  }, [page, slug])

  const copyFromEnglish = useCallback(() => {
    if (!page) return
    setArTitle(enTitle)
    setPage(prev => prev ? { ...prev, content_ar: prev.content_en, title_ar: prev.title_en } : null)
    setResetKey(t => t + 1)
  }, [page, enTitle])

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
    if (!confirm(`Delete "${page.title_en}"? This cannot be undone.`)) return
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
        <div>
          <h1 className="text-2xl font-bold">{page.title_en}</h1>
          <p className="text-muted-foreground">/{page.slug}</p>
        </div>

        <div className="flex items-center gap-3">
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

      {page && (
        <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Lang)}>
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="ar">Arabic</TabsTrigger>
          </TabsList>

          <TabsContent value="en" className="mt-4 space-y-4">
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="en-title">Title (English)</Label>
                <Input
                  id="en-title"
                  value={enTitle}
                  onChange={(e) => setEnTitle(e.target.value)}
                  placeholder="Page title"
                />
              </div>
            )}
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={slugValue}
                  onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="url-slug"
                />
              </div>
            )}
            <RichTextEditor
              key={`${resetKey}-en`}
              title="English Content"
              initialContent={page.content_en}
              onSave={handleSave}
              isSaving={saving}
              onImageUpload={handleImageUpload}
              onDiscard={handleDiscard}
            />
          </TabsContent>

          <TabsContent value="ar" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ar-title">Title (Arabic)</Label>
              <Button variant="outline" size="sm" onClick={copyFromEnglish}>
                <Copy className="mr-2 h-4 w-4" />
                Copy from English
              </Button>
            </div>
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="ar-title">Title (Arabic)</Label>
                <Input
                  id="ar-title"
                  value={arTitle}
                  onChange={(e) => setArTitle(e.target.value)}
                  placeholder="عنوان الصفحة"
                />
              </div>
            )}
            <RichTextEditor
              key={`${resetKey}-ar`}
              title="Arabic Content"
              initialContent={page.content_ar || ""}
              onSave={handleSave}
              isSaving={saving}
              onImageUpload={handleImageUpload}
              onDiscard={handleDiscard}
            />
          </TabsContent>
        </Tabs>
      )}

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
