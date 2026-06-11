"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getPortalById } from "@/lib/portals"
import { infoPagesCollection } from "@/lib/pb-collections"
import pb from "@/lib/pb"
import type { InfoPage } from "@/types/cms"
import { RichTextEditor } from "@/components/cms/RichTextEditor"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function CmsServiceEditorPage() {
  const params = useParams()
  const portalId = params.portalId as string
  const serviceId = params.serviceId as string

  const portal = getPortalById(portalId)
  const service = portal?.services.find((s) => s.id === serviceId)

  const [page, setPage] = useState<InfoPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!service) return

    async function init() {
      let existingPage = await infoPagesCollection.getBySlug(serviceId)

      if (!existingPage) {
        try {
          existingPage = await infoPagesCollection.create({
            slug: serviceId,
            title: service!.name.en,
          })
        } catch {
          // Record may already exist from a previous attempt
          // (e.g., list rules blocked getBySlug but create succeeded)
          existingPage = await infoPagesCollection.getBySlug(serviceId)
        }
      }

      setPage(existingPage)
      setLoading(false)
    }

    init()
  }, [service, serviceId])

  const handleSave = useCallback(
    async (html: string) => {
      if (!page) return
      setSaving(true)
      try {
        const updated = await infoPagesCollection.update(page.id, {
          content: html,
        })
        setPage(updated)
      } finally {
        setSaving(false)
      }
    },
    [page]
  )

  const togglePublish = useCallback(async () => {
    if (!page) return
    setPublishing(true)
    try {
      const updated = await infoPagesCollection.update(page.id, {
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
      const updated = await infoPagesCollection.updateWithFiles(page.id, {}, [file])
      const filename = (updated.media as string[])[0]
      return pb.files.getUrl(updated, filename)
    },
    [page]
  )

  if (!portal || !service) {
    return (
      <div className="space-y-4">
        <Link
          href={`/cms/info/${portalId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p>Service not found</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/cms/info/${portalId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{service.name.en}</h1>
          <p className="text-muted-foreground">
            {portal.title} &rarr; {service.name.en}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="publish"
              checked={page?.is_published || false}
              onCheckedChange={togglePublish}
              disabled={publishing}
            />
            <Label htmlFor="publish" className="font-medium">
              {page?.is_published ? "Published" : "Draft"}
            </Label>
          </div>
        </div>
      </div>

      {page && (
        <RichTextEditor
          title={`Editing: ${service.name.en}`}
          initialContent={page.content}
          onSave={handleSave}
          isSaving={saving}
          onImageUpload={handleImageUpload}
        />
      )}
    </div>
  )
}
