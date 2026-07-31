"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { blogCategoriesCollection } from "@/lib/pb-collections"
import type { BlogCategory } from "@/types/cms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, ArrowLeft, Plus, Trash2, Pencil, X, Check } from "lucide-react"

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newKey, setNewKey] = useState("")
  const [newLabelEn, setNewLabelEn] = useState("")
  const [newLabelAr, setNewLabelAr] = useState("")
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editKey, setEditKey] = useState("")
  const [editLabelEn, setEditLabelEn] = useState("")
  const [editLabelAr, setEditLabelAr] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await blogCategoriesCollection.getAll()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async () => {
    const trimmedKey = newKey.trim()
    const trimmedLabelEn = newLabelEn.trim()
    if (!trimmedKey || !trimmedLabelEn) {
      alert("Key and Label (EN) are required.")
      return
    }
    setAdding(true)
    try {
      await blogCategoriesCollection.create({
        key: trimmedKey,
        label_en: trimmedLabelEn,
        label_ar: newLabelAr.trim() || undefined,
      })
      setNewKey("")
      setNewLabelEn("")
      setNewLabelAr("")
      load()
    } catch {
      alert("Failed to add category. The key may already exist.")
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"?`)) return
    setDeletingId(id)
    try {
      await blogCategoriesCollection.delete(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert("Failed to delete category. It may be in use.")
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (cat: BlogCategory) => {
    setEditingId(cat.id)
    setEditKey(cat.key)
    setEditLabelEn(cat.label_en)
    setEditLabelAr(cat.label_ar || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditKey("")
    setEditLabelEn("")
    setEditLabelAr("")
  }

  const saveEdit = async (id: string) => {
    const trimmedKey = editKey.trim()
    const trimmedLabelEn = editLabelEn.trim()
    if (!trimmedKey || !trimmedLabelEn) return
    setSavingEdit(true)
    try {
      const updated = await blogCategoriesCollection.update(id, {
        key: trimmedKey,
        label_en: trimmedLabelEn,
        label_ar: editLabelAr.trim() || undefined,
      })
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      cancelEdit()
    } catch {
      alert("Failed to update category.")
    } finally {
      setSavingEdit(false)
    }
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

      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Manage blog categories</p>
      </div>

      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
            disabled={adding}
            className="w-36"
          />
          <Input
            placeholder="Label (EN)"
            value={newLabelEn}
            onChange={(e) => setNewLabelEn(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
            disabled={adding}
            className="w-48"
          />
          <Input
            placeholder="Label (AR)"
            value={newLabelAr}
            onChange={(e) => setNewLabelAr(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
            disabled={adding}
            className="w-48"
          />
        </div>
        <Button onClick={handleAdd} disabled={adding}>
          {adding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Label (EN)</TableHead>
                <TableHead>Label (AR)</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  {editingId === cat.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editLabelEn}
                          onChange={(e) => setEditLabelEn(e.target.value)}
                          className="h-8 w-40"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editLabelAr}
                          onChange={(e) => setEditLabelAr(e.target.value)}
                          className="h-8 w-40"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => saveEdit(cat.id)}
                            disabled={savingEdit || !editKey.trim() || !editLabelEn.trim()}
                          >
                            {savingEdit ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{cat.key}</TableCell>
                      <TableCell>{cat.label_en}</TableCell>
                      <TableCell dir="rtl">{cat.label_ar || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(cat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat.id, cat.label_en)}
                            disabled={deletingId === cat.id}
                          >
                            {deletingId === cat.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
