import PocketBase from "pocketbase"
import { t } from "@/lib/i18n"
import { getCurrentLang } from "@/lib/current-lang"
import type { BilingualString, Lang } from "@/types/form"

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
)

pb.autoCancellation(false)

export const authStore = pb.authStore

export function getCurrentUser() {
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return null
  }
  return pb.authStore.model as any
}

export function isAuthenticated(): boolean {
  return pb.authStore.isValid
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin" || user?.role === "super_admin"
}

export function isSuperAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "super_admin"
}

export function isExpert(): boolean {
  const user = getCurrentUser()
  return user?.role === "expert"
}

export async function authWithPassword(email: string, password: string) {
  const authData = await pb
    .collection("users")
    .authWithPassword(email.toLowerCase(), password)
  return authData
}

export async function refreshAuth() {
  if (!pb.authStore.isValid) {
    throw new Error("No valid auth token")
  }
  await pb.collection("users").authRefresh()
}

export async function logout() {
  pb.authStore.clear()
}

export async function requestPasswordReset(email: string) {
  await pb.collection("users").requestPasswordReset(email.toLowerCase())
}

export async function confirmPasswordReset(token: string, password: string) {
  await pb.collection("users").confirmPasswordReset(token, password, password)
}

const FIELD_LABELS: Record<string, BilingualString> = {
  email: { en: "email address", ar: "البريد الإلكتروني" },
  username: { en: "username", ar: "اسم المستخدم" },
  national_id: { en: "national ID", ar: "الهوية الوطنية" },
  iqama: { en: "iQama number", ar: "رقم الإقامة" },
  phone: { en: "phone number", ar: "رقم الهاتف" },
  contact_number: { en: "contact number", ar: "رقم الاتصال" },
  whatsapp_number: { en: "WhatsApp number", ar: "رقم الواتساب" },
  name: { en: "name", ar: "الاسم" },
  title: { en: "title", ar: "العنوان" },
  password: { en: "Password", ar: "كلمة المرور" },
}

function fieldLabel(field: string, lang: Lang): string {
  const known = FIELD_LABELS[field]
  if (known) return t(known, lang)
  return field.replace(/_/g, " ")
}

/**
 * Renders a field-specific min-length message for the password field.
 * The minimum is extracted from the server's own message (e.g. "at least 6
 * characters") so it stays accurate if the server config ever changes.
 */
function minLengthMessage(
  field: string,
  serverMessage: unknown,
  lang: Lang
): string | undefined {
  if (field !== "password") return undefined
  const n = String(serverMessage ?? "").match(/at least (\d+)/)?.[1]
  if (!n) {
    return t(
      { en: "Password is too short.", ar: "كلمة المرور قصيرة جدًا." },
      lang
    )
  }
  return t(
    {
      en: `Password must be at least ${n} characters.`,
      ar: `يجب أن تكون كلمة المرور ${n} أحرف على الأقل.`,
    },
    lang
  )
}

const VALIDATION_CODE_MESSAGES: Record<string, BilingualString> = {
  validation_required: {
    en: "This field is required.",
    ar: "هذا الحقل مطلوب.",
  },
  validation_email: {
    en: "Please enter a valid email address.",
    ar: "يرجى إدخال بريد إلكتروني صحيح.",
  },
  validation_min: {
    en: "The value is too short.",
    ar: "القيمة قصيرة جدًا.",
  },
  validation_max: {
    en: "The value is too long.",
    ar: "القيمة طويلة جدًا.",
  },
  validation_url: {
    en: "Please enter a valid URL.",
    ar: "يرجى إدخال رابط صحيح.",
  },
}

/**
 Pocket base error handler
**/

function getFieldValidationMessage(
  error: unknown,
  lang: Lang
): string | undefined {
  if (!error || typeof error !== "object") return undefined
  const err = error as { data?: unknown; response?: unknown }
  const body = err.data ?? err.response
  if (!body || typeof body !== "object") return undefined

  const maps = [
    (body as { data?: unknown }).data,
    (body as { details?: unknown }).details,
  ]

  for (const map of maps) {
    if (!map || typeof map !== "object") continue
    for (const [field, value] of Object.entries(
      map as Record<string, unknown>
    )) {

      if (typeof value === "string") {
        const msg = value.trim()
        if (!msg) continue
        return minLengthMessage(field, msg, lang) ?? msg
      }
      if (!value || typeof value !== "object") continue
      const v = value as { code?: unknown; message?: unknown }
      const code = String(v.code ?? "")
      if (code.includes("not_unique")) {
        return t(
          {
            en: `This ${fieldLabel(field, "en")} is already in use.`,
            ar: `${fieldLabel(field, "ar")} مستخدم بالفعل.`,
          },
          lang
        )
      }
      const minMsg = minLengthMessage(field, v.message, lang)
      if (minMsg) return minMsg
      const mapped = VALIDATION_CODE_MESSAGES[code]
      if (mapped) return t(mapped, lang)
      if (typeof v.message === "string" && v.message.trim()) return v.message
    }
  }
  return undefined
}

export function handlePocketBaseError(
  error: any,
  lang: Lang = getCurrentLang()
): string {
  if (error?.message?.includes("fetch")) {
    return t(
      {
        en: "PocketBase server is not accessible. Please check if the server is running.",
        ar: "تعذر الوصول إلى خادم PocketBase. يرجى التأكد من أن الخادم يعمل.",
      },
      lang
    )
  }
  if (error?.status === 400) {
    return (
      getFieldValidationMessage(error, lang) ??
      t(
        {
          en: "Invalid request data. Please check your input.",
          ar: "بيانات الطلب غير صالحة. يرجى التحقق من الإدخال.",
        },
        lang
      )
    )
  }
  if (error?.status === 401) {
    return t(
      {
        en: "Authentication required. Please log in.",
        ar: "مطلوب تسجيل الدخول. يرجى تسجيل الدخول.",
      },
      lang
    )
  }
  if (error?.status === 403) {
    return t(
      {
        en: "Access denied. You do not have permission to perform this action.",
        ar: "تم رفض الوصول. ليس لديك صلاحية لتنفيذ هذا الإجراء.",
      },
      lang
    )
  }
  if (error?.status === 404) {
    return t(
      {
        en: "Resource not found. The requested item may have been deleted.",
        ar: "العنصر غير موجود. ربما تم حذف العنصر المطلوب.",
      },
      lang
    )
  }
  if (error?.status === 422) {
    return t(
      {
        en: "Validation error. Please check your input data.",
        ar: "خطأ في التحقق من البيانات. يرجى مراجعة بيانات الإدخال.",
      },
      lang
    )
  }
  if (error?.status >= 500) {
    return t(
      {
        en: "Server error. Please try again later.",
        ar: "خطأ في الخادم. يرجى المحاولة لاحقًا.",
      },
      lang
    )
  }
  return (
    error?.message ||
    t(
      {
        en: "An unexpected error occurred. Please try again.",
        ar: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      },
      lang
    )
  )
}

export function getErrorMessage(error: unknown, lang?: Lang): string {
  return handlePocketBaseError(error, lang)
}

export default pb
