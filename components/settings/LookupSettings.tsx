"use client"
import { useUiTranslation } from "@/hooks/useUiTranslation"
import { usePermissions } from "@/hooks/usePermissions"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useLang } from "@/lib/lang-context"
import { useLookups, type LookupType } from "@/hooks/useLookups"
import { formatDate } from "@/lib/format-date"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

export function LookupSettings({ type }: { type: LookupType }) {
  const title =
    type === "tool_types"
      ? { en: "Tool types", ar: "أنواع الأدوات" }
      : { en: "User types", ar: "أنواع المستخدمين" }
  const ui = useUiTranslation()

  const access = usePermissions()
  const router = useRouter()
  const canReadSettings = access.can("settings.read")
  const isAuthLoading = access.isLoading
  const { lang } = useLang()
  const {
    lookups,
    isLoading,
    error,
    fetchLookups,
    createLookup,
    updateLookup,
    deleteLookup,
  } = useLookups()
  const visibleLookups = lookups.filter((item) => item.type === type)

  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingLookup, setEditingLookup] = useState<string | null>(null)
  const [deletingLookupId, setDeletingLookupId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    key: "",
    label_en: "",
    label_ar: "",
  })

  useEffect(() => {
    if (!isAuthLoading && !canReadSettings) {
      router.push("/dashboard")
    }
  }, [isAuthLoading, canReadSettings, router])

  useEffect(() => {
    if (!isAuthLoading && canReadSettings) void fetchLookups(type)
  }, [type, fetchLookups, isAuthLoading, canReadSettings])

  const resetForm = () => {
    setFormData({ key: "", label_en: "", label_ar: "" })
    setEditingLookup(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (id: string) => {
    const item = visibleLookups.find((l) => l.id === id)
    if (!item) return
    setFormData({
      key: item.key,
      label_en: item.label_en,
      label_ar: item.label_ar,
    })
    setEditingLookup(id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!access.can(editingLookup ? "settings.update" : "settings.create"))
      return
    if (
      !formData.key.trim() ||
      !formData.label_en.trim() ||
      !formData.label_ar.trim()
    )
      return

    if (saving) return
    setSaving(true)
    try {
      const payload = {
        key: formData.key.trim(),
        label_en: formData.label_en.trim(),
        label_ar: formData.label_ar.trim(),
      }
      const saved = editingLookup
        ? await updateLookup(editingLookup, payload)
        : await createLookup({ ...payload, type })
      if (!saved) return
      setDialogOpen(false)
      resetForm()
      await fetchLookups(type)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (
      !deletingLookupId ||
      !visibleLookups.some((item) => item.id === deletingLookupId) ||
      !access.can("settings.delete")
    )
      return
    const success = await deleteLookup(deletingLookupId)
    if (success) {
      setDeleteDialogOpen(false)
      setDeletingLookupId(null)
      fetchLookups(type)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    )
  }

  if (!canReadSettings) {
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
          <h1 className="text-2xl font-bold text-primary">{title[lang]}</h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? `إدارة ${title.ar}`
              : `Manage ${title.en.toLowerCase()}`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title[lang]}</CardTitle>
          <Button
            disabled={!access.can("settings.create")}
            onClick={openCreateDialog}
          >
            <Plus className="me-2 h-4 w-4" />
            {lang === "ar" ? "إضافة قيمة" : "Add Lookup"}
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
                <TableHead>{lang === "ar" ? "المفتاح" : "Key"}</TableHead>
                <TableHead>
                  {lang === "ar" ? "التسمية (إنجليزي)" : "Label (EN)"}
                </TableHead>
                <TableHead>
                  {lang === "ar" ? "التسمية (عربي)" : "Label (AR)"}
                </TableHead>
                <TableHead>
                  {lang === "ar" ? "تاريخ الإنشاء" : "Created"}
                </TableHead>
                <TableHead className="text-right">
                  {lang === "ar" ? "إجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                  </TableCell>
                </TableRow>
              ) : visibleLookups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <List className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {lang === "ar" ? "لا توجد قيم" : "No lookups found"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!access.can("settings.create")}
                        onClick={openCreateDialog}
                      >
                        {lang === "ar"
                          ? "أضف أول قيمة"
                          : "Add your first lookup"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visibleLookups.map((lookup) => (
                  <TableRow key={lookup.id}>
                    <TableCell className="font-mono text-sm">
                      {lookup.key}
                    </TableCell>
                    <TableCell>{lookup.label_en}</TableCell>
                    <TableCell dir="rtl">{lookup.label_ar}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lookup.created)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={!access.can("settings.update")}
                          onClick={() => openEditDialog(lookup.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={!access.can("settings.delete")}
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
          if (saving) return
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLookup
                ? lang === "ar"
                  ? "تعديل القيمة"
                  : "Edit Lookup"
                : lang === "ar"
                  ? "إضافة قيمة"
                  : "Add Lookup"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{title[lang]}</p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label>{lang === "ar" ? "المفتاح" : "Key"}</Label>
              <Input
                placeholder={ui("e.g. survey")}
                value={formData.key}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, key: e.target.value }))
                }
                disabled={!!editingLookup}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {lang === "ar" ? "التسمية (إنجليزي)" : "Label (English)"}
              </Label>
              <Input
                placeholder={ui("e.g. Survey")}
                value={formData.label_en}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label_en: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {lang === "ar" ? "التسمية (عربي)" : "Label (Arabic)"}
              </Label>
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
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !access.can(
                  editingLookup ? "settings.update" : "settings.create"
                ) ||
                !formData.key.trim() ||
                !formData.label_en.trim() ||
                !formData.label_ar.trim()
              }
            >
              {editingLookup
                ? lang === "ar"
                  ? "حفظ التغييرات"
                  : "Save Changes"
                : lang === "ar"
                  ? "إنشاء"
                  : "Create"}
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
            <DialogTitle>
              {lang === "ar" ? "حذف القيمة" : "Delete Lookup"}
            </DialogTitle>
          </DialogHeader>
          <p className="py-2">
            {lang === "ar"
              ? "هل أنت متأكد من حذف هذه القيمة؟ لا يمكن التراجع عن هذا الإجراء."
              : "Are you sure you want to delete this lookup? This action cannot be undone."}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingLookupId(null)
              }}
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              disabled={!access.can("settings.delete")}
              onClick={handleDelete}
            >
              {lang === "ar" ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
