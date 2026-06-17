"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { homePagesCollection } from "@/lib/pb-collections"
import { HomePage } from "@/types/cms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Loader2, Plus, Pencil, Lock, Trash2 } from "lucide-react"
import pb from "@/lib/pb"
import { useAuth } from "@/hooks/useAuth"

export default function CmsHomePagesListPage() {
  const { isSuperAdmin } = useAuth()
  const [pages, setPages] = useState<HomePage[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newSlug, setNewSlug] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [creatingPage, setCreatingPage] = useState(false)

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = () => {
    setLoading(true)
    pb.collection("home_pages")
      .getFullList()
      .then((data) => {
        setPages(data as unknown as HomePage[])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleCreate = async () => {
    if (!newSlug.trim() || !newTitle.trim()) return
    setCreatingPage(true)
    try {
      await homePagesCollection.create({
        slug: newSlug.trim(),
        title: newTitle.trim(),
      })
      setNewSlug("")
      setNewTitle("")
      setShowCreate(false)
      loadPages()
    } catch {
      alert("Failed to create page. Slug must be unique.")
    } finally {
      setCreatingPage(false)
    }
  }

  const togglePublish = async (page: HomePage) => {
    try {
      const updated = await homePagesCollection.update(page.id, {
        is_published: !page.is_published,
      })
      setPages((prev) => prev.map((p) => (p.id === page.id ? updated : p)))
    } catch {
      alert("Failed to update status.")
    }
  }

  const handleDelete = async (page: HomePage) => {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return
    try {
      await homePagesCollection.delete(page.id)
      setPages((prev) => prev.filter((p) => p.id !== page.id))
    } catch {
      alert("Failed to delete page.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home Pages</h1>
          <p className="text-muted-foreground">
            Manage About Us, Contact Us, and other site pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button variant="outline" onClick={() => setShowCreate(!showCreate)}>
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          )}
        </div>
      </div>

      {isSuperAdmin && showCreate && (
        <div className="rounded-md border bg-gray-50 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="e.g., about, contact, privacy"
              />
              <p className="text-xs text-muted-foreground">
                This will be the URL: /{newSlug || "slug"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., About Us"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creatingPage || !newSlug.trim() || !newTitle.trim()}>
              {creatingPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Page
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No pages yet.</p>
          {isSuperAdmin && (
            <Button onClick={() => setShowCreate(true)} className="mt-4">
              Create your first page
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                  <TableCell>{new Date(page.updated).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => togglePublish(page)}
                      className="flex items-center gap-1"
                    >
                      {page.is_published ? (
                        <Badge className="bg-green-600 text-white">
                          <Eye className="mr-1 h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Lock className="mr-1 h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/cms/home-pages/${page.slug}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(page)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                      {page.is_published && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/${page.slug}`} target="_blank">
                            <Eye className="h-4 w-4 text-green-600" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
