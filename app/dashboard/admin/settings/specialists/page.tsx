"use client"
import { usePermissions } from "@/hooks/usePermissions"
import { useState } from "react"
import {
  UsersRound,
  HandHeart,
  Brain,
  Stethoscope,
  GraduationCap,
  Landmark,
  LayoutGrid,
  Search,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"
import styles from "./specialists.module.css"
import { toast } from "sonner"
import {
  deleteSpecialistItem,
  SpecialistDeletionBlockedError,
  type SpecialistDeletionLink,
} from "@/lib/specialist-deletion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { useSpecialists } from "@/hooks/useSpecialists"
import pb, { getErrorMessage } from "@/lib/pb"
import type { SpecialistCategory, SpecialistRole } from "@/lib/specialist-types"
export default function SpecialistsSettings() {
  const access = usePermissions()
  const { isAdmin, isSuperAdmin, isLoading } = useAuth()
  const { lang } = useLang()
  const ar = lang === "ar"
  const { categories, roles, loading, error, refresh } = useSpecialists()
  const [formOpen, setFormOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [roleSearch, setRoleSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [formError, setFormError] = useState("")
  const [kind, setKind] = useState<"category" | "role">("category")
  const [id, setId] = useState("")
  const [en, setEn] = useState("")
  const [arabic, setArabic] = useState("")
  const [category, setCategory] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: "category" | "role"
    id: string
    name: string
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [deleteLinks, setDeleteLinks] = useState<SpecialistDeletionLink[]>([])
  const [deleteLinkTotal, setDeleteLinkTotal] = useState(0)
  const reset = () => {
    setId("")
    setEn("")
    setArabic("")
    setCategory("")
  }
  if (isLoading) return <p>Loading...</p>
  if (!isAdmin && !isSuperAdmin)
    return <p role="alert">{ar ? "غير مصرح" : "Access denied"}</p>
  const edit = (
    k: "category" | "role",
    r: SpecialistCategory | SpecialistRole
  ) => {
    setKind(k)
    setId(r.id)
    setEn("name_en" in r ? r.name_en : r.role_name_en)
    setArabic("name_ar" in r ? r.name_ar : r.role_name_ar)
    setCategory("category" in r ? r.category : "")
    setNotice("")
    setFormError("")
    setFormOpen(true)
  }
  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!access.can(id ? "settings.update" : "settings.create")) return
    if (!en.trim() || !arabic.trim() || (kind === "role" && !category)) {
      setFormError(
        ar
          ? "يرجى تعبئة جميع الحقول المطلوبة"
          : "Please complete all required fields."
      )
      return
    }
    setFormError("")
    setSaving(true)
    setNotice("")
    try {
      const col = pb.collection(
        kind === "category" ? "specialist_role_categories" : "roles_management"
      )
      const data =
        kind === "category"
          ? {
              name_en: en.trim(),
              name_ar: arabic.trim(),
              ...(id
                ? {}
                : {
                    key: `custom-${crypto.randomUUID()}`,
                    order: categories.length,
                    is_active: true,
                  }),
            }
          : {
              role_name_en: en.trim(),
              role_name_ar: arabic.trim(),
              category,
              ...(id ? {} : { order: roles.length + 1, is_active: true }),
            }
      if (id) await col.update(id, data)
      else await col.create(data)
      reset()
      setFormOpen(false)
      await refresh()
      setNotice(ar ? "تم الحفظ" : "Saved")
    } catch (e) {
      setNotice(getErrorMessage(e))
      setFormError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }
  async function toggleAvailability(k: "category" | "role", rid: string) {
    if (
      !window.confirm(
        ar
          ? "هل تريد تغيير حالة التفعيل؟"
          : "Change availability for new selections?"
      )
    )
      return
    setSaving(true)
    setNotice("")
    try {
      const item = (k === "category" ? categories : roles).find(
        (x) => x.id === rid
      )
      await pb
        .collection(
          k === "category" ? "specialist_role_categories" : "roles_management"
        )
        .update(rid, { is_active: !item?.is_active })
      reset()
      await refresh()
    } catch (e) {
      setNotice(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }
  function openDeleteDialog(target: NonNullable<typeof deleteTarget>) {
    setDeleteError("")
    setDeleteLinks([])
    setDeleteLinkTotal(0)
    setDeleteTarget(target)
  }
  async function confirmDelete() {
    if (!access.can("settings.delete")) return
    if (!deleteTarget) return
    setDeleteError("")
    setDeleteLinks([])
    setDeleteLinkTotal(0)
    setSaving(true)
    setNotice("")
    try {
      await deleteSpecialistItem(deleteTarget.kind, deleteTarget.id, ar)
      if (id === deleteTarget.id && kind === deleteTarget.kind) reset()
      setDeleteTarget(null)
      await refresh()
      setNotice(ar ? "تم الحذف" : "Deleted")
      toast.success(ar ? "تم الحذف" : "Deleted")
    } catch (error) {
      const message = getErrorMessage(error, lang)
      setDeleteError(message)
      if (error instanceof SpecialistDeletionBlockedError) {
        setDeleteLinks(error.links)
        setDeleteLinkTotal(error.total)
      }
      setNotice(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }
  const icons = [
    HandHeart,
    Brain,
    Stethoscope,
    GraduationCap,
    Landmark,
    LayoutGrid,
  ]
  const categoryIcon = (cid: string, small = false) => {
    const index = categories.findIndex((c) => c.id === cid)
    const safeIndex = index < 0 ? 5 : index % icons.length
    const Icon = icons[safeIndex]
    return (
      <span
        className={`${styles.categoryIcon} ${styles[`tone${safeIndex}`]} ${small ? styles.smallIcon : ""}`}
      >
        <Icon size={small ? 14 : 19} aria-hidden="true" />
      </span>
    )
  }
  const matches = (query: string, ...values: string[]) =>
    values.some((value) =>
      value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
    )
  const filteredCategories = categories.filter((c) =>
    matches(categorySearch, c.name_en, c.name_ar)
  )
  const filteredRoles = roles.filter(
    (r) =>
      (!roleFilter || r.category === roleFilter) &&
      matches(roleSearch, r.role_name_en, r.role_name_ar)
  )
  const add = (k: "category" | "role") => {
    reset()
    setKind(k)
    setFormError("")
    setFormOpen(true)
  }
  const status = (
    k: "category" | "role",
    item: SpecialistCategory | SpecialistRole
  ) => (
    <button
      type="button"
      disabled={saving}
      className={`${styles.status} ${item.is_active ? styles.active : styles.inactive}`}
      title={
        item.is_active
          ? ar
            ? "تعطيل"
            : "Deactivate"
          : ar
            ? "تفعيل"
            : "Activate"
      }
      aria-label={`${item.is_active ? (ar ? "تعطيل" : "Deactivate") : ar ? "تفعيل" : "Activate"} ${"name_en" in item ? item.name_en : item.role_name_en}`}
      onClick={() => {
        if (access.can("settings.update")) void toggleAvailability(k, item.id)
      }}
    >
      <span />
      {item.is_active ? (ar ? "نشط" : "Active") : ar ? "غير نشط" : "Inactive"}
    </button>
  )
  const actions = (
    k: "category" | "role",
    item: SpecialistCategory | SpecialistRole
  ) => (
    <div className={styles.actions}>
      <button
        type="button"
        disabled={saving || !access.can("settings.update")}
        className={styles.edit}
        onClick={() => {
          if (access.can("settings.update")) edit(k, item)
        }}
      >
        <Pencil size={14} aria-hidden="true" />
        {ar ? "تعديل" : "Edit"}
      </button>
      <button
        type="button"
        disabled={saving || !access.can("settings.delete")}
        className={styles.delete}
        onClick={() =>
          openDeleteDialog({
            kind: k,
            id: item.id,
            name:
              "name_en" in item
                ? ar
                  ? item.name_ar
                  : item.name_en
                : ar
                  ? item.role_name_ar
                  : item.role_name_en,
          })
        }
      >
        <Trash2 size={14} aria-hidden="true" />
        {ar ? "حذف" : "Delete"}
      </button>
    </div>
  )
  const empty = (span: number) => (
    <tr>
      <td colSpan={span} className={styles.empty}>
        {loading
          ? ar
            ? "جارٍ التحميل…"
            : "Loading…"
          : error
            ? ar
              ? "تعذر تحميل البيانات"
              : "Unable to load records."
            : ar
              ? "لا توجد نتائج مطابقة"
              : "No matching records found."}
      </td>
    </tr>
  )
  return (
    <div className={styles.page} dir={ar ? "rtl" : "ltr"}>
      <header className={styles.pageHeader}>
        <span className={styles.heroIcon}>
          <UsersRound size={27} aria-hidden="true" />
        </span>
        <div>
          <h1>
            {ar ? "فئات وأدوار التخصص" : "Specialist categories and roles"}
          </h1>
          <p>
            {ar
              ? "إدارة فئات التخصص وأدوارها باللغتين"
              : "Manage the specialist categories and their roles in both languages"}
          </p>
        </div>
      </header>
      {(error || notice) && (
        <div className={styles.notice} role="status">
          {error || notice}
          {error && (
            <button type="button" onClick={() => void refresh()}>
              {ar ? "إعادة المحاولة" : "Retry"}
            </button>
          )}
        </div>
      )}
      <section className={styles.card} aria-labelledby="categories-heading">
        <div className={styles.toolbar}>
          <div className={styles.sectionHeading}>
            <span className={`${styles.sectionIcon} ${styles.mint}`}>
              <UsersRound size={23} aria-hidden="true" />
            </span>
            <div>
              <h2 id="categories-heading">
                {ar ? "فئات التخصص" : "Specialist role categories"}
              </h2>
              <p>
                {ar
                  ? "الفئات الرئيسية لأدوار المتخصصين"
                  : "Main categories for specialist roles"}
              </p>
            </div>
          </div>
          <div className={styles.controls}>
            <label className={styles.search}>
              <Search size={16} aria-hidden="true" />
              <input
                aria-label={ar ? "البحث في الفئات" : "Search categories"}
                placeholder={ar ? "البحث في الفئات…" : "Search in categories…"}
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
            </label>
            <button
              type="button"
              className={styles.add}
              disabled={
                saving || loading || !!error || !access.can("settings.create")
              }
              onClick={() => add("category")}
            >
              <Plus size={17} />
              {ar ? "إضافة فئة" : "Add category"}
            </button>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${styles.categoryTable}`}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">
                  <span className="sr-only">{ar ? "أيقونة" : "Icon"}</span>
                </th>
                <th scope="col">Name (English)</th>
                <th scope="col">الاسم (العربية)</th>
                <th scope="col">{ar ? "الأدوار" : "Roles"}</th>
                <th scope="col">{ar ? "الحالة" : "Status"}</th>
                <th scope="col">{ar ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                !error &&
                filteredCategories.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td>{categoryIcon(c.id)}</td>
                    <td>{c.name_en}</td>
                    <td dir="rtl">{c.name_ar || "—"}</td>
                    <td>
                      <span className={styles.count}>
                        {roles.filter((r) => r.category === c.id).length}
                      </span>
                    </td>
                    <td>{status("category", c)}</td>
                    <td>{actions("category", c)}</td>
                  </tr>
                ))}
              {(loading || error || !filteredCategories.length) && empty(7)}
            </tbody>
          </table>
        </div>
      </section>
      <section className={styles.card} aria-labelledby="roles-heading">
        <div className={styles.toolbar}>
          <div className={styles.sectionHeading}>
            <span className={`${styles.sectionIcon} ${styles.blue}`}>
              <UsersRound size={23} aria-hidden="true" />
            </span>
            <div>
              <h2 id="roles-heading">
                {ar ? "أدوار التخصص" : "Specialist roles"}
              </h2>
              <p>{ar ? "الأدوار ضمن كل فئة" : "Roles within each category"}</p>
            </div>
          </div>
          <div className={styles.controls}>
            <label className={styles.filter}>
              {ar ? "الفئة" : "Category"}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">
                  {ar ? "جميع الفئات" : "All categories"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {ar ? c.name_ar : c.name_en}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.search}>
              <Search size={16} aria-hidden="true" />
              <input
                aria-label={ar ? "البحث في الأدوار" : "Search roles"}
                placeholder={ar ? "البحث في الأدوار…" : "Search in roles…"}
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
              />
            </label>
            <button
              type="button"
              className={styles.add}
              disabled={
                saving || loading || !!error || !access.can("settings.create")
              }
              onClick={() => add("role")}
            >
              <Plus size={17} />
              {ar ? "إضافة دور" : "Add role"}
            </button>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${styles.roleTable}`}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{ar ? "الفئة" : "Category"}</th>
                <th scope="col">Name (English)</th>
                <th scope="col">الاسم (العربية)</th>
                <th scope="col">{ar ? "الحالة" : "Status"}</th>
                <th scope="col">{ar ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                !error &&
                filteredRoles.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className={styles.categoryLabel}>
                        {categoryIcon(r.category, true)}
                        <span>
                          {categories.find((c) => c.id === r.category)?.[
                            ar ? "name_ar" : "name_en"
                          ] || (ar ? "بدون فئة" : "Uncategorized")}
                        </span>
                      </div>
                    </td>
                    <td>{r.role_name_en}</td>
                    <td dir="rtl">{r.role_name_ar || "—"}</td>
                    <td>{status("role", r)}</td>
                    <td>{actions("role", r)}</td>
                  </tr>
                ))}
              {(loading || error || !filteredRoles.length) && empty(6)}
            </tbody>
          </table>
        </div>
        {!loading && !error && (
          <p className={styles.summary}>
            {ar
              ? `عرض ${filteredRoles.length} من ${roles.length} دور`
              : `Showing ${filteredRoles.length} of ${roles.length} roles`}
          </p>
        )}
      </section>
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!saving) setFormOpen(open)
        }}
      >
        <DialogContent showCloseButton={!saving} dir={ar ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {kind === "category"
                ? id
                  ? ar
                    ? "تعديل الفئة"
                    : "Edit category"
                  : ar
                    ? "إضافة فئة"
                    : "Add category"
                : id
                  ? ar
                    ? "تعديل الدور"
                    : "Edit role"
                  : ar
                    ? "إضافة دور"
                    : "Add role"}
            </DialogTitle>
            <DialogDescription>
              {ar
                ? "أدخل الاسم باللغتين الإنجليزية والعربية."
                : "Enter the name in both English and Arabic."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className={styles.form}>
            {kind === "role" && (
              <label>
                {ar ? "الفئة" : "Category"}
                <select
                  required
                  value={category}
                  disabled={saving}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">
                    {ar ? "اختر فئة" : "Select category"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {ar ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Name (English)
              <input
                dir="ltr"
                required
                value={en}
                disabled={saving}
                onChange={(e) => setEn(e.target.value)}
              />
            </label>
            <label>
              الاسم (العربية)
              <input
                dir="rtl"
                required
                value={arabic}
                disabled={saving}
                onChange={(e) => setArabic(e.target.value)}
              />
            </label>
            {formError && (
              <p role="alert" className={styles.formError}>
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setFormOpen(false)}
              >
                {ar ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={saving || loading || !!error}>
                {saving
                  ? ar
                    ? "جارٍ الحفظ…"
                    : "Saving…"
                  : id
                    ? ar
                      ? "حفظ التعديل"
                      : "Save changes"
                    : ar
                      ? "إضافة"
                      : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !saving) setDeleteTarget(null)
        }}
      >
        <DialogContent showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>{ar ? "تأكيد الحذف" : "Confirm deletion"}</DialogTitle>
            <DialogDescription>
              {ar
                ? `هل تريد حذف «${deleteTarget?.name}» نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Permanently delete “${deleteTarget?.name}”? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {deleteError}
            </p>
          )}
          {deleteLinks.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">
                {ar
                  ? "العناصر المرتبطة التي تمنع الحذف"
                  : "Linked items preventing deletion"}
              </p>
              <ul className="max-h-64 space-y-3 overflow-y-auto rounded-lg border p-3">
                {deleteLinks.map((link) => (
                  <li key={link.id} className="space-y-1">
                    {link.href ? (
                      <a
                        className="text-primary underline"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span>{link.label}</span>
                    )}
                    {link.detail && (
                      <p className="text-xs text-muted-foreground">
                        {link.detail}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              {deleteLinkTotal > deleteLinks.length && (
                <p className="text-xs text-muted-foreground">
                  {ar
                    ? `عرض ${deleteLinks.length} من ${deleteLinkTotal} عنصر مرتبط.`
                    : `Showing ${deleteLinks.length} of ${deleteLinkTotal} linked items.`}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setDeleteTarget(null)}
            >
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={() => {
                if (access.can("settings.delete")) void confirmDelete()
              }}
            >
              {saving
                ? ar
                  ? "جارٍ الحذف..."
                  : "Deleting..."
                : ar
                  ? "حذف"
                  : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
