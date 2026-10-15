"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useLang } from "@/lib/lang-context"
import { usePermissions } from "@/hooks/usePermissions"
import { getErrorMessage } from "@/lib/pb"
import {
  securityApi,
  refreshPermissions,
  securityModules,
  type SecurityRole,
  type SecurityUser,
  type SecurityState,
  type SecurityAudit,
} from "@/lib/security"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"

const blank = (): SecurityRole => ({
  id: "",
  key: "",
  name_en: "",
  name_ar: "",
  description: "",
  is_active: true,
  is_system: false,
  permissions: [],
  user_count: 0,
})
export function SecurityManagement() {
  const { lang } = useLang()
  const ar = lang === "ar"
  const t = (en: string, arabic: string) => (ar ? arabic : en)
  const access = usePermissions()
  const [state, setState] = useState<SecurityState | null>(null)
  const [tab, setTab] = useState("roles"),
    [query, setQuery] = useState("")
  const [role, setRole] = useState<SecurityRole | null>(null),
    [original, setOriginal] = useState("")
  const [user, setUser] = useState<SecurityUser | null>(null),
    [userRoles, setUserRoles] = useState<string[]>([])
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("")
  const [audit, setAudit] = useState<SecurityAudit[]>([]),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1)
  const [notice, setNotice] = useState<"" | "saved">("")
  const dirty =
    (!!role && JSON.stringify(role) !== original) ||
    (!!user &&
      JSON.stringify([...userRoles].sort()) !==
        JSON.stringify([...user.roles].sort()))
  async function load() {
    setLoading(true)
    setError("")
    try {
      const data = await securityApi<SecurityState>("/state")
      setState(data)
      setAudit(data.audit)
    } catch (e) {
      setState(null)
      setError(getErrorMessage(e, lang))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (access.isSuperAdmin) void load()
    else if (!access.isLoading) setLoading(false)
  }, [access.isSuperAdmin, access.isLoading]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])
  const leave = () =>
    !dirty ||
    window.confirm(
      t("Discard unsaved changes?", "تجاهل التغييرات غير المحفوظة؟")
    )
  const chooseRole = (next: SecurityRole) => {
    if (leave()) {
      setUser(null)
      setRole({ ...next, permissions: [...next.permissions] })
      setOriginal(JSON.stringify(next))
      setNotice("")
    }
  }
  function toggle(key: string, checked: boolean) {
    if (!role) return
    const [module, action] = key.split(".")
    let permissions = role.permissions.filter((p) => p !== key)
    if (checked) {
      permissions.push(key)
      if (action !== "read" && !permissions.includes(module + ".read"))
        permissions.push(module + ".read")
    } else if (action === "read")
      permissions = permissions.filter((p) => !p.startsWith(module + "."))
    setRole({ ...role, permissions })
  }
  async function mutate(action: () => Promise<unknown>) {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      await action()
      setRole(null)
      setUser(null)
      refreshPermissions()
      await load()
      setNotice("saved")
    } catch (e) {
      setError(getErrorMessage(e, lang))
    } finally {
      setBusy(false)
    }
  }
  async function saveRole(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    const old = state?.roles.find((r) => r.id === role.id)?.permissions || []
    const added = role.permissions.filter((p) => !old.includes(p))
    const removed = old.filter((p) => !role.permissions.includes(p))
    if (
      !window.confirm(
        t("Save role changes?", "حفظ تغييرات الدور؟") +
          "\n" +
          t("Add: ", "إضافة: ") +
          (added.join(", ") || "—") +
          "\n" +
          t("Remove: ", "إزالة: ") +
          (removed.join(", ") || "—")
      )
    )
      return
    await mutate(() =>
      securityApi(
        role.id ? "/roles/" + role.id : "/roles",
        role.id ? "PATCH" : "POST",
        role
      )
    )
  }
  const auditActions: Record<string, [string, string]> = {
    "role.create": ["Role created", "إنشاء دور"],
    "role.update": ["Role updated", "تعديل دور"],
    "role.delete": ["Role deleted", "حذف دور"],
    "user.roles.update": ["User roles updated", "تعديل أدوار مستخدم"],
    "user.create": ["User created", "إنشاء مستخدم"],
    "user.update": ["User updated", "تعديل مستخدم"],
    "user.delete": ["User deleted", "حذف مستخدم"],
    "user.password.reset": ["Password reset", "إعادة تعيين كلمة المرور"],
    "expert.approve": ["Expert approved", "اعتماد خبير"],
    "payment.set_amount": ["Payment amount set", "تحديد مبلغ الدفع"],
    "payment.approve": ["Payment approved", "اعتماد دفعة"],
    "payment.reject": ["Payment rejected", "رفض دفعة"],
  }
  const auditActionLabel = (action: string) => {
    const label = auditActions[action]
    return label ? t(label[0], label[1]) : t("Security change", "تغيير أمني")
  }
  const auditTargetLabel = (target: string) =>
    target === "security_roles"
      ? t("Role", "الدور")
      : target === "users"
        ? t("User", "المستخدم")
        : target === "cases"
          ? t("Case", "الحالة")
          : t("Record", "السجل")
  async function auditPage(next: number) {
    setBusy(true)
    setError("")
    try {
      const data = await securityApi<{
        items: SecurityAudit[]
        totalPages: number
      }>("/audit?page=" + next)
      setAudit(data.items)
      setPage(next)
      setPages(data.totalPages)
    } catch (e) {
      setError(getErrorMessage(e, lang))
    } finally {
      setBusy(false)
    }
  }
  if (access.isLoading)
    return <p role="status">{t("Loading access…", "جارٍ تحميل الصلاحيات…")}</p>
  if (!access.isSuperAdmin)
    return (
      <div role="alert">
        {t(
          "Access denied. Super Admin access is required.",
          "الوصول مرفوض. هذه الصفحة للمشرف العام."
        )}
        {access.error && (
          <Button onClick={access.refresh}>
            {t("Retry", "إعادة المحاولة")}
          </Button>
        )}
      </div>
    )
  const visibleUsers =
    state?.users.filter((u) =>
      (u.name + u.email).toLowerCase().includes(query.toLowerCase())
    ) || []
  return (
    <section dir={ar ? "rtl" : "ltr"} className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
            <ShieldCheck />
            {t("Security management", "إدارة الأمان")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(
              "Control staff access with roles and explicit module permissions.",
              "إدارة وصول الموظفين عبر الأدوار وصلاحيات الوحدات."
            )}
          </p>
        </div>
        <Link
          href="/dashboard/admin/users"
          className="text-sm font-medium text-primary underline"
        >
          {t("Manage users", "إدارة المستخدمين")}
        </Link>
      </header>
      <nav
        aria-label={t("Security sections", "أقسام الأمان")}
        className="flex flex-wrap gap-2 border-b pb-3"
      >
        {[
          ["roles", "Roles & permissions", "الأدوار والصلاحيات"],
          ["users", "User access", "وصول المستخدمين"],
          ["audit", "Audit history", "سجل التدقيق"],
        ].map(([key, en, arabic]) => (
          <Button
            key={key}
            variant={tab === key ? "default" : "outline"}
            disabled={busy}
            onClick={() => {
              if (leave()) {
                setTab(key)
                setRole(null)
                setUser(null)
                setQuery("")
                if (key === "audit") void auditPage(1)
              }
            }}
          >
            {t(en, arabic)}
          </Button>
        ))}
      </nav>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {error}
          <Button
            className="ms-3"
            variant="outline"
            onClick={() => void load()}
          >
            {t("Retry", "إعادة المحاولة")}
          </Button>
        </div>
      )}
      {notice && (
        <p role="status" className="text-green-800">
          {notice === "saved" ? t("Changes saved.", "تم حفظ التغييرات.") : ""}
        </p>
      )}
      {loading ? (
        <p role="status">
          {t("Loading security records…", "جارٍ تحميل سجلات الأمان…")}
        </p>
      ) : (
        state && (
          <>
            {tab !== "audit" && (
              <Input
                aria-label={t("Search", "بحث")}
                placeholder={t(
                  "Search by name or email…",
                  "بحث بالاسم أو البريد…"
                )}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-w-md"
              />
            )}
            {tab === "roles" && (
              <div className="grid items-start gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="space-y-2">
                  <Button
                    className="w-full"
                    disabled={busy}
                    onClick={() => chooseRole(blank())}
                  >
                    {t("Create role", "إنشاء دور")}
                  </Button>
                  {state.roles
                    .filter((r) =>
                      (r.name_en + r.name_ar + r.key)
                        .toLowerCase()
                        .includes(query.toLowerCase())
                    )
                    .map((r) => (
                      <button
                        key={r.id}
                        disabled={busy}
                        onClick={() => chooseRole(r)}
                        className={`w-full rounded-lg border p-4 text-start transition-colors hover:border-primary ${role?.id === r.id ? "border-primary bg-primary/5" : "bg-white"}`}
                      >
                        <span className="block font-semibold">
                          {ar ? r.name_ar : r.name_en}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {r.user_count} {t("users", "مستخدمين")} ·{" "}
                          {r.is_active
                            ? t("Active", "نشط")
                            : t("Inactive", "غير نشط")}
                          {r.is_system ? " · " + t("System", "نظام") : ""}
                        </span>
                      </button>
                    ))}
                  {!state.roles.length && (
                    <p>
                      {t(
                        "No roles yet. Create the first role.",
                        "لا توجد أدوار. أنشئ الدور الأول."
                      )}
                    </p>
                  )}
                </aside>
                <Card className="min-w-0">
                  <CardHeader>
                    <CardTitle>
                      {role
                        ? role.id
                          ? t("Edit role", "تعديل الدور")
                          : t("New role", "دور جديد")
                        : t("Select a role", "اختر دوراً")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {role ? (
                      <form onSubmit={saveRole} className="space-y-5">
                        <fieldset disabled={busy} className="space-y-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {(
                              [
                                ["key", "Role key", "مفتاح الدور"],
                                ["name_en", "English name", "الاسم الإنجليزي"],
                                ["name_ar", "Arabic name", "الاسم العربي"],
                                ["description", "Description", "الوصف"],
                              ] as const
                            ).map(([key, en, arabic]) => (
                              <label
                                key={key}
                                className="space-y-2 text-sm font-medium"
                              >
                                <span>{t(en, arabic)}</span>
                                <Input
                                  required={key !== "description"}
                                  disabled={key === "key" && !!role.id}
                                  value={role[key]}
                                  onChange={(e) =>
                                    setRole({ ...role, [key]: e.target.value })
                                  }
                                />
                              </label>
                            ))}
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={role.is_active}
                              onChange={(e) =>
                                setRole({
                                  ...role,
                                  is_active: e.target.checked,
                                })
                              }
                            />
                            {t("Active role", "دور نشط")}
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {t(
                              "Other grants require Read. Removing Read clears all grants in that module.",
                              "الصلاحيات الأخرى تتطلب القراءة. إلغاء القراءة يلغي جميع صلاحيات الوحدة."
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {t(
                              "Swipe horizontally to see all CRUD columns.",
                              "اسحب أفقياً لعرض جميع أعمدة الصلاحيات."
                            )}
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-sm">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  {[
                                    t("Module", "الوحدة"),
                                    t("Create", "إنشاء"),
                                    t("Read", "قراءة"),
                                    t("Update", "تعديل"),
                                    t("Delete", "حذف"),
                                  ].map((s) => (
                                    <th key={s} className="p-3 text-start">
                                      {s}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {securityModules.map(([module, en, arabic]) => (
                                  <tr key={module} className="border-b">
                                    <th className="p-3 text-start font-medium">
                                      {t(en, arabic)}
                                    </th>
                                    {["create", "read", "update", "delete"].map(
                                      (action) => {
                                        const key = module + "." + action
                                        return (
                                          <td key={key} className="p-3">
                                            <input
                                              type="checkbox"
                                              aria-label={
                                                t(en, arabic) +
                                                " " +
                                                t(
                                                  action,
                                                  (
                                                    {
                                                      create: "إنشاء",
                                                      read: "قراءة",
                                                      update: "تعديل",
                                                      delete: "حذف",
                                                    } as Record<string, string>
                                                  )[action]
                                                )
                                              }
                                              disabled={
                                                !state.permissions.some(
                                                  (p) => p.key === key
                                                )
                                              }
                                              checked={role.permissions.includes(
                                                key
                                              )}
                                              onChange={(e) =>
                                                toggle(key, e.target.checked)
                                              }
                                            />
                                          </td>
                                        )
                                      }
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {state.permissions
                              .filter(
                                (p) =>
                                  ![
                                    "create",
                                    "read",
                                    "update",
                                    "delete",
                                  ].includes(p.action)
                              )
                              .map((p) => (
                                <label
                                  key={p.key}
                                  className="flex max-w-full min-w-0 flex-wrap items-center gap-2 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={role.permissions.includes(p.key)}
                                    onChange={(e) =>
                                      toggle(p.key, e.target.checked)
                                    }
                                  />
                                  <span className="min-w-0 break-words">
                                    {ar ? p.name_ar : p.name_en}
                                  </span>
                                </label>
                              ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Button type="submit" disabled={!dirty}>
                              {busy
                                ? t("Saving…", "جارٍ الحفظ…")
                                : t("Save role", "حفظ الدور")}
                            </Button>
                            {dirty && (
                              <span className="text-sm text-amber-800">
                                {t("Unsaved changes", "تغييرات غير محفوظة")}
                              </span>
                            )}
                            {role.id && (
                              <Button
                                type="button"
                                variant="destructive"
                                disabled={role.is_system || role.user_count > 0}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      t(
                                        "Permanently delete this role?",
                                        "حذف هذا الدور نهائياً؟"
                                      )
                                    )
                                  )
                                    void mutate(() =>
                                      securityApi("/roles/" + role.id, "DELETE")
                                    )
                                }}
                              >
                                {t("Delete role", "حذف الدور")}
                              </Button>
                            )}
                          </div>
                          {role.id &&
                            (role.is_system || role.user_count > 0) && (
                              <p className="text-xs text-muted-foreground">
                                {t(
                                  "System roles and assigned roles cannot be deleted.",
                                  "لا يمكن حذف أدوار النظام أو الأدوار المسندة."
                                )}
                              </p>
                            )}
                        </fieldset>
                      </form>
                    ) : (
                      <p className="text-muted-foreground">
                        {t(
                          "Choose a role to review its permissions, or create a custom role.",
                          "اختر دوراً لمراجعة صلاحياته أو أنشئ دوراً مخصصاً."
                        )}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {tab === "users" && (
              <div className="grid items-start gap-5 lg:grid-cols-2">
                <div className="space-y-2">
                  {visibleUsers.map((u) => (
                    <button
                      key={u.id}
                      disabled={busy}
                      className={`w-full rounded-lg border p-4 text-start ${user?.id === u.id ? "border-primary bg-primary/5" : "bg-white"}`}
                      onClick={() => {
                        if (leave()) {
                          setRole(null)
                          setUser(u)
                          setUserRoles([...u.roles])
                        }
                      }}
                    >
                      <span className="block font-semibold">{u.name}</span>
                      <span className="block text-sm break-all text-muted-foreground">
                        {u.email} · {u.role} ·{" "}
                        {u.is_active
                          ? t("Active", "نشط")
                          : t("Inactive", "غير نشط")}
                      </span>
                    </button>
                  ))}
                  {!visibleUsers.length && (
                    <p>
                      {t("No matching users.", "لا يوجد مستخدمون مطابقون.")}
                    </p>
                  )}
                </div>
                <Card className="min-w-0">
                  <CardHeader>
                    <CardTitle>
                      {user?.name || t("Select a user", "اختر مستخدماً")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "Security roles apply to admin accounts. Account types remain separate.",
                            "تطبق أدوار الأمان على حسابات المشرفين، وتبقى أنواع الحسابات مستقلة."
                          )}
                        </p>
                        <fieldset
                          disabled={busy || user.role !== "admin"}
                          className="space-y-3"
                        >
                          {state.roles.map((r) => (
                            <label
                              key={r.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={userRoles.includes(r.id)}
                                onChange={(e) =>
                                  setUserRoles(
                                    e.target.checked
                                      ? [...userRoles, r.id]
                                      : userRoles.filter((id) => id !== r.id)
                                  )
                                }
                              />
                              {ar ? r.name_ar : r.name_en}
                              {!r.is_active && (
                                <span className="text-muted-foreground">
                                  ({t("Inactive", "غير نشط")})
                                </span>
                              )}
                            </label>
                          ))}
                        </fieldset>
                        {user.role === "admin" && (
                          <Button
                            disabled={busy || !dirty}
                            onClick={() => {
                              const names = (ids: string[]) =>
                                ids
                                  .map((id) => {
                                    const r = state.roles.find(
                                      (r) => r.id === id
                                    )
                                    return r ? (ar ? r.name_ar : r.name_en) : id
                                  })
                                  .join(", ") || "—"
                              if (
                                window.confirm(
                                  t(
                                    "Save access changes?",
                                    "حفظ تغييرات الوصول؟"
                                  ) +
                                    "\n" +
                                    t("Add: ", "إضافة: ") +
                                    names(
                                      userRoles.filter(
                                        (id) => !user.roles.includes(id)
                                      )
                                    ) +
                                    "\n" +
                                    t("Remove: ", "إزالة: ") +
                                    names(
                                      user.roles.filter(
                                        (id) => !userRoles.includes(id)
                                      )
                                    )
                                )
                              )
                                void mutate(() =>
                                  securityApi(
                                    "/users/" + user.id + "/roles",
                                    "PUT",
                                    { roles: userRoles }
                                  )
                                )
                            }}
                          >
                            {busy
                              ? t("Saving…", "جارٍ الحفظ…")
                              : t("Save access", "حفظ الوصول")}
                          </Button>
                        )}
                        {dirty && (
                          <p className="text-sm text-amber-800">
                            {t("Unsaved changes", "تغييرات غير محفوظة")}
                          </p>
                        )}
                        <h3 className="font-semibold">
                          {t(
                            "Current effective permissions",
                            "الصلاحيات الفعلية الحالية"
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Refreshes after saving role assignments.",
                            "تحدث بعد حفظ إسناد الأدوار."
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {user.role === "super_admin" ? (
                            <p>{t("All permissions", "جميع الصلاحيات")}</p>
                          ) : user.permissions.length ? (
                            user.permissions.map((p) => (
                              <span
                                key={p}
                                className="rounded border bg-muted/40 px-2 py-1 text-xs"
                                dir="ltr"
                              >
                                {p}
                              </span>
                            ))
                          ) : (
                            <p>
                              {t(
                                "No permissions granted.",
                                "لا توجد صلاحيات ممنوحة."
                              )}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {tab === "audit" && (
              <Card className="min-w-0">
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-sm">
                      <thead>
                        <tr className="border-b">
                          {[
                            t("Time", "الوقت"),
                            t("Actor", "المنفذ"),
                            t("Action / target", "الإجراء / الهدف"),
                            t("Changes", "التغييرات"),
                          ].map((s) => (
                            <th key={s} className="p-3 text-start">
                              {s}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {audit.map((a) => (
                          <tr key={a.id} className="border-b align-top">
                            <td className="p-3">
                              {new Date(a.created).toLocaleString(
                                ar ? "ar-SA" : "en-GB"
                              )}
                            </td>
                            <td className="p-3">
                              <span className="block font-medium">
                                {state.users.find((user) => user.id === a.actor)
                                  ?.name ||
                                  t(
                                    "Former or unavailable user",
                                    "مستخدم سابق أو غير متاح"
                                  )}
                              </span>
                              <span
                                dir="ltr"
                                className="block text-xs text-muted-foreground"
                              >
                                {a.actor}
                              </span>
                            </td>
                            <td className="p-3 break-all">
                              <span className="font-medium">
                                {auditActionLabel(a.action)}
                              </span>
                              <span
                                dir="ltr"
                                className="block text-xs text-muted-foreground"
                              >
                                {a.action}
                              </span>
                              <br />
                              {auditTargetLabel(a.target_type)}:{" "}
                              <span dir="ltr">{a.target_id}</span>
                            </td>
                            <td className="p-3">
                              <details>
                                <summary className="cursor-pointer text-primary">
                                  {t("Inspect changes", "عرض التغييرات")}
                                </summary>
                                <p>{t("Before", "قبل")}</p>
                                <pre
                                  dir="ltr"
                                  className="max-w-xs overflow-auto rounded bg-muted p-2 text-xs break-all whitespace-pre-wrap"
                                >
                                  {JSON.stringify(a.before, null, 2)}
                                </pre>
                                <p>{t("After", "بعد")}</p>
                                <pre
                                  dir="ltr"
                                  className="max-w-xs overflow-auto rounded bg-muted p-2 text-xs break-all whitespace-pre-wrap"
                                >
                                  {JSON.stringify(a.after, null, 2)}
                                </pre>
                              </details>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!audit.length && (
                    <p className="py-6 text-muted-foreground">
                      {t(
                        "No security changes recorded.",
                        "لم تسجل تغييرات أمنية."
                      )}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <Button
                      variant="outline"
                      disabled={busy || page <= 1}
                      onClick={() => void auditPage(page - 1)}
                    >
                      {t("Previous", "السابق")}
                    </Button>
                    <span>
                      {page} / {Math.max(1, pages)}
                    </span>
                    <Button
                      variant="outline"
                      disabled={busy || page >= pages}
                      onClick={() => void auditPage(page + 1)}
                    >
                      {t("Next", "التالي")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )
      )}
    </section>
  )
}
