"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLookups, type LookupType } from "@/hooks/useLookups"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Pencil, Plus, Trash2, List } from "lucide-react"

const LOOKUP_TYPES: { value: LookupType; label: string }[] = [
  { value: "tool_types", label: "Tool Types" },
  { value: "case_types", label: "Case Types" },
  { value: "user_types", label: "User Types" },
]

export default function LookupsPage() {
  const router = useRouter()
  const { isSuperAdmin, isLoading: isAuthLoading } = useAuth()
  const {
    lookups,
    isLoading,
    error,
    fetchLookups,
    createLookup,
    updateLookup,
    deleteLookup,
  } = useLookups()

  const [filterType, setFilterType] = useState<LookupType>("tool_types")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingLookup, setEditingLookup] = useState<string | null>(null)
  const [deletingLookupId, setDeletingLookupId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    key: "",
    label_en: "",
    label_ar: "",
  })
  const [formType, setFormType] = useState<LookupType>("tool_types")
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!isAuthLoading && !isSuperAdmin) {
      router.push("/dashboard")
    }
  }, [isAuthLoading, isSuperAdmin, router])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchLookups(filterType)
  }, [filterType, fetchLookups])

  const resetForm = () => {
    setFormData({ key: "", label_en: "", label_ar: "" })
    setFormType("tool_types")
    setEditingLookup(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (id: string) => {
    const item = lookups.find((l) => l.id === id)
    if (!item) return
    setFormData({
      key: item.key,
      label_en: item.label_en,
      label_ar: item.label_ar,
    })
    setFormType(item.type as LookupType)
    setEditingLookup(id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.key || !formData.label_en || !formData.label_ar) return

    if (editingLookup) {
      await updateLookup(editingLookup, {
        key: formData.key,
        label_en: formData.label_en,
        label_ar: formData.label_ar,
      })
    } else {
      await createLookup({
        type: formType,
        key: formData.key,
        label_en: formData.label_en,
        label_ar: formData.label_ar,
      })
    }
    setDialogOpen(false)
    resetForm()
    fetchLookups(filterType)
  }

  const handleDelete = async () => {
    if (!deletingLookupId) return
    const success = await deleteLookup(deletingLookupId)
    if (success) {
      setDeleteDialogOpen(false)
      setDeletingLookupId(null)
      fetchLookups(filterType)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/admin/settings")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Lookups</h1>
          <p className="text-muted-foreground">Manage lookup tables</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                Filter by Type
              </Label>
              <Select
                value={filterType}
                onValueChange={(v) => setFilterType(v as LookupType)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOOKUP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="me-2 h-4 w-4" />
            Add Lookup
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Label (EN)</TableHead>
                <TableHead>Label (AR)</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : lookups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <List className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No lookups found</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={openCreateDialog}
                      >
                        Add your first lookup
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                lookups.map((lookup) => (
                  <TableRow key={lookup.id}>
                    <TableCell className="font-mono text-sm">
                      {lookup.key}
                    </TableCell>
                    <TableCell>{lookup.label_en}</TableCell>
                    <TableCell dir="rtl">{lookup.label_ar}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(lookup.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditDialog(lookup.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setDeletingLookupId(lookup.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLookup ? "Edit Lookup" : "Add Lookup"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingLookup && (
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formType}
                  onValueChange={(v) => setFormType(v as LookupType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOOKUP_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                placeholder="e.g. survey"
                value={formData.key}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, key: e.target.value }))
                }
                disabled={!!editingLookup}
              />
            </div>
            <div className="space-y-2">
              <Label>Label (English)</Label>
              <Input
                placeholder="e.g. Survey"
                value={formData.label_en}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label_en: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Label (Arabic)</Label>
              <Input
                placeholder="e.g. استبيان"
                value={formData.label_ar}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label_ar: e.target.value }))
                }
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.key || !formData.label_en || !formData.label_ar
              }
            >
              {editingLookup ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeletingLookupId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lookup</DialogTitle>
          </DialogHeader>
          <p className="py-2">
            Are you sure you want to delete this lookup? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingLookupId(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
