"use client"
import { classificationParent } from "@/lib/classification"
import { useClassifications } from "@/hooks/useClassifications"
import { usePermissions } from "@/hooks/usePermissions"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/pb"
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
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
} from "lucide-react"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"

export default function BlogCategoriesPage() {
  const access = usePermissions()
  const { lang } = useLang()
  const { main: MAIN_CLASSIFICATIONS } = useClassifications()
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newMain, setNewMain] = useState("")
  const [editMain, setEditMain] = useState("")
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
    if (!trimmedKey || !trimmedLabelEn || !newMain) {
      alert(
        t(
          {
            en: "Key and Label (EN) are required.",
            ar: "المفتاح والتسمية (إنجليزي) مطلوبان.",
          },
          lang
        )
      )
      return
    }
    setAdding(true)
    try {
      await blogCategoriesCollection.create({
        main_category: newMain,
        key: trimmedKey,
        label_en: trimmedLabelEn,
        label_ar: newLabelAr.trim() || undefined,
      })
      setNewKey("")
      setNewLabelEn("")
      setNewLabelAr("")
      load()
    } catch (err) {
      toast.error(
        t(
          {
            en: "Failed to add category. The key may already exist.",
            ar: "فشل إضافة التصنيف. قد يكون المفتاح موجوداً بالفعل.",
          },
          lang
        ),
        { description: getErrorMessage(err) }
      )
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(t({ en: `Delete "${label}"?`, ar: `حذف "${label}"؟` }, lang)))
      return
    setDeletingId(id)
    try {
      await blogCategoriesCollection.delete(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      toast.error(
        t(
          {
            en: "Failed to delete category. It may be in use.",
            ar: "فشل حذف التصنيف. ربما يكون قيد الاستخدام.",
          },
          lang
        ),
        { description: getErrorMessage(err) }
      )
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (cat: BlogCategory) => {
    setEditMain(cat.main_category || classificationParent(cat.key))
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
        main_category: editMain,
        key: trimmedKey,
        label_en: trimmedLabelEn,
        label_ar: editLabelAr.trim() || undefined,
      })
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      cancelEdit()
    } catch (err) {
      toast.error(
        t({ en: "Failed to update category.", ar: "فشل تحديث التصنيف." }, lang),
        { description: getErrorMessage(err) }
      )
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
          <BackIcon className="h-4 w-4" />
          {t({ en: "Back", ar: "رجوع" }, lang)}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {t({ en: "Categories", ar: "التصنيفات" }, lang)}
        </h1>
        <p className="text-muted-foreground">
          {t(
            { en: "Manage blog categories", ar: "إدارة تصنيفات المدونة" },
            lang
          )}
        </p>
      </div>

      <section className="rounded-md border p-4 space-y-3">
        <h2 className="font-semibold">{lang === "ar" ? "التصنيفات الرئيسية الموحّدة" : "Unified main categories"}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">{MAIN_CLASSIFICATIONS.map(c => <li key={c.key}>{c[lang]}{c.media_only ? (lang === "ar" ? " — محتوى إعلامي فقط" : " — media content only") : ""}</li>)}</ul>
      </section>
      <h2 className="font-semibold">{lang === "ar" ? "التصنيفات الفرعية" : "Subcategories"}</h2>
      <label className="block space-y-2 text-sm">
        <span>{lang === "ar" ? "التصنيف الرئيسي للتصنيف الفرعي الجديد" : "Parent for new subcategory"}</span>
        <select className="h-10 rounded-md border bg-background px-3" value={newMain} onChange={e => setNewMain(e.target.value)}>
          <option value="">{lang === "ar" ? "اختر التصنيف الرئيسي" : "Choose main category"}</option>
          {MAIN_CLASSIFICATIONS.map(c => <option key={c.key} value={c.key}>{c[lang]}</option>)}
        </select>
      </label>
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder={t({ en: "Key", ar: "المفتاح" }, lang)}
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
            disabled={adding || !access.can("cms.create")}
            className="w-36"
          />
          <Input
            placeholder={t({ en: "Label (EN)", ar: "التسمية (إنجليزي)" }, lang)}
            value={newLabelEn}
            onChange={(e) => setNewLabelEn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
            disabled={adding || !access.can("cms.create")}
            className="w-48"
          />
          <Input
            placeholder={t({ en: "Label (AR)", ar: "التسمية (عربي)" }, lang)}
            value={newLabelAr}
            onChange={(e) => setNewLabelAr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
            disabled={adding || !access.can("cms.create")}
            className="w-48"
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={adding || !access.can("cms.create")}
        >
          {adding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {t({ en: "Add", ar: "إضافة" }, lang)}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-md bg-gray-100"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground">
          {t({ en: "No categories yet.", ar: "لا توجد تصنيفات بعد." }, lang)}
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "ar" ? "التصنيف الرئيسي / المفتاح" : "Main category / key"}</TableHead>
                <TableHead>
                  {t({ en: "Label (EN)", ar: "التسمية (إنجليزي)" }, lang)}
                </TableHead>
                <TableHead>
                  {t({ en: "Label (AR)", ar: "التسمية (عربي)" }, lang)}
                </TableHead>
                <TableHead className="w-32">
                  {t({ en: "Actions", ar: "إجراءات" }, lang)}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  {editingId === cat.id ? (
                    <>
                      <TableCell>
                        <select aria-label={lang === "ar" ? "التصنيف الرئيسي" : "Main category"} value={editMain} onChange={e => setEditMain(e.target.value)} className="h-8 w-full border rounded bg-background">
                          {MAIN_CLASSIFICATIONS.map(c => <option key={c.key} value={c.key}>{c[lang]}</option>)}
                        </select>
                        <Input
                          value={editKey}
                          disabled
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
                            disabled={
                              savingEdit ||
                              !editKey.trim() ||
                              !editLabelEn.trim()
                            }
                          >
                            {savingEdit ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium"><div>{MAIN_CLASSIFICATIONS.find(c => c.key === (cat.main_category || classificationParent(cat.key)))?.[lang] || (lang === "ar" ? "غير مرتبط" : "Unmapped")}</div><code className="text-xs text-muted-foreground">{cat.key}</code></TableCell>
                      <TableCell>{cat.label_en}</TableCell>
                      <TableCell dir="rtl">{cat.label_ar || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!access.can("cms.update")}
                            onClick={() => startEdit(cat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat.id, cat.label_en)}
                            disabled={
                              deletingId === cat.id || !access.can("cms.delete")
                            }
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
