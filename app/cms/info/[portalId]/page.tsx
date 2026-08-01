"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getPortalById } from "@/lib/portals"
import { infoPagesCollection } from "@/lib/pb-collections"
import pb from "@/lib/pb"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Loader2,
  Plus,
  FileText,
  Trash2,
  Pencil,
} from "lucide-react"

interface InfoPageRecord {
  id: string
  slug: string
  title_en: string
  icon?: string
  is_published: boolean
}

export default function CmsPortalServicesPage() {
  const params = useParams()
  const router = useRouter()
  const portalId = params.portalId as string
  const portal = getPortalById(portalId)

  const [pages, setPages] = useState<InfoPageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadPages = useCallback(async () => {
    const data = await pb.collection("info_pages").getFullList({
      filter: `portal_name = "${portalId}"`,
      sort: "-created",
    })
    setPages(data as unknown as InfoPageRecord[])
  }, [portalId])

  useEffect(() => {
    if (!portal) return
    loadPages().finally(() => setLoading(false))
  }, [portal, loadPages])

  const handleNewPage = async () => {
    setCreating(true)
    try {
      const newPage = await infoPagesCollection.create({
        slug: `new-page-${Date.now()}`,
        title_en: "New Page",
        portal_name: portalId,
      })
      router.push(`/cms/info/${portalId}/${newPage.slug}`)
    } catch {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await infoPagesCollection.delete(id)
      setPages((prev) => prev.filter((p) => p.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (!portal) {
    return (
      <div className="space-y-4">
        <Link
          href="/cms/info"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p>Portal not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cms/info"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{portal.title.en}</h1>
          <p className="text-muted-foreground">
            Manage info pages for this portal
          </p>
        </div>

        {/* <Button onClick={handleNewPage} disabled={creating}>
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Page
        </Button> */}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">No pages yet.</p>
          <Button onClick={handleNewPage} className="mt-4" disabled={creating}>
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create your first page
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => {
            const iconUrl = p.icon ? pb.files.getUrl(p as never, p.icon) : null
            return (
              <Card
                key={p.id}
                className="flex items-center gap-4 p-4 transition-all hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${portal.accent}15` }}
                >
                  {iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={iconUrl}
                      alt=""
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    <FileText
                      className="h-6 w-6"
                      style={{ color: portal.accent }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium">{p.title_en}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {p.is_published ? (
                      <Badge
                        variant="default"
                        className="text-xs"
                        style={{
                          backgroundColor: portal.accent,
                          color: "#fff",
                        }}
                      >
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/cms/info/${portalId}/${p.slug}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id, p.title_en)}
                    disabled={deleting === p.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
