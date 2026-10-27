import type { User } from "@/types/user"
import PocketBase from "pocketbase"
import { t } from "@/lib/i18n"
import { getCurrentLang } from "@/lib/current-lang"
import { normalizeEmail } from "@/lib/validators"
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
  return pb.authStore.model as unknown as User
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
    .authWithPassword(normalizeEmail(email), password)
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
  await pb.collection("users").requestPasswordReset(normalizeEmail(email))
}

export async function confirmPasswordReset(token: string, password: string) {
  await pb.collection("users").confirmPasswordReset(token, password, password)
}

const FIELD_LABELS: Record<string, BilingualString> = {
  contactNumber: { en: "Mobile number", ar: "رقم الجوال" },
  contact_number: { en: "Mobile number", ar: "رقم الجوال" },
  children: { en: "Children", ar: "الأطفال" },
  date_of_birth: { en: "Date of birth", ar: "تاريخ الميلاد" },
  gender: { en: "Gender", ar: "الجنس" },
  relationship: { en: "Relationship to child", ar: "صلة القرابة بالطفل" },
  portal_type: { en: "Service category", ar: "فئة الخدمة" },
  service_type: { en: "Requested service", ar: "الخدمة المطلوبة" },

  confirmPassword: { en: "Confirm password", ar: "تأكيد كلمة المرور" },
  passwordConfirm: { en: "Confirm password", ar: "تأكيد كلمة المرور" },
  country_of_residence: { en: "Country of residence", ar: "بلد الإقامة" },
  city: { en: "City", ar: "المدينة" },
  highest_academic_degree: {
    en: "Highest academic degree",
    ar: "أعلى درجة علمية",
  },
  degree_title: { en: "Degree title", ar: "مسمى الدرجة" },
  field_of_study: { en: "Field of study", ar: "مجال الدراسة" },
  age_group: { en: "Age group", ar: "الفئة العمرية" },
  specialization_type: { en: "Role group", ar: "مجموعة الأدوار" },
  specialist_roles: { en: "Roles", ar: "الأدوار" },
  consultation_mode: { en: "Consultation mode", ar: "طريقة الاستشارة" },
  fee: { en: "Consultation fee", ar: "رسوم الاستشارة" },
  iban: { en: "IBAN", ar: "رقم الآيبان" },
  expert_iban: { en: "IBAN", ar: "رقم الآيبان" },
  availability: { en: "Availability", ar: "أوقات التوفر" },
  cv: { en: "CV attachment", ar: "مرفق السيرة الذاتية" },
  profile_photo: { en: "Profile photo", ar: "الصورة الشخصية" },
  biography: { en: "Biography", ar: "النبذة التعريفية" },
  whatsapp_country_code: {
    en: "WhatsApp country code",
    ar: "رمز دولة الواتساب",
  },
  public_name_en: {
    en: "Public name (English)",
    ar: "الاسم العام (الإنجليزية)",
  },
  public_name_ar: { en: "Public name (Arabic)", ar: "الاسم العام (العربية)" },
  public_qualification_en: {
    en: "Qualification (English)",
    ar: "المؤهل (الإنجليزية)",
  },
  public_qualification_ar: {
    en: "Qualification (Arabic)",
    ar: "المؤهل (العربية)",
  },
  public_specialty_en: { en: "Specialty (English)", ar: "التخصص (الإنجليزية)" },
  public_specialty_ar: { en: "Specialty (Arabic)", ar: "التخصص (العربية)" },
  short_bio_en: {
    en: "Biography (English)",
    ar: "النبذة التعريفية (الإنجليزية)",
  },
  short_bio_ar: { en: "Biography (Arabic)", ar: "النبذة التعريفية (العربية)" },

  email: { en: "email address", ar: "البريد الإلكتروني" },
  username: { en: "username", ar: "اسم المستخدم" },
  national_id: { en: "national ID", ar: "الهوية الوطنية" },
  iqama: { en: "iQama number", ar: "رقم الإقامة" },
  phone: { en: "phone number", ar: "رقم الهاتف" },
  whatsapp_number: { en: "WhatsApp number", ar: "رقم الواتساب" },
  name: { en: "name", ar: "الاسم" },
  title: { en: "title", ar: "العنوان" },
  password: { en: "Password", ar: "كلمة المرور" },
}

export function fieldLabel(field: string, lang: Lang): string {
  const child = field.match(/^children\.(\d+)\.(.+)$/)
  if (child) return `${lang === "ar" ? "الطفل" : "Child"} ${Number(child[1]) + 1} — ${fieldLabel(child[2], lang)}`
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
  if (field !== "password" || !/short|at least|minimum/i.test(String(serverMessage ?? ""))) return undefined
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

/**
 * PocketBase validation error codes that we can translate cleanly.
 * Unknown codes fall back to the server message (or a generic translated one).
 */
const VALIDATION_CODE_MESSAGES: Record<string, BilingualString> = {
  registration_phone: { en: "Enter a phone number with its country code, for example +966501234567.", ar: "أدخل رقم الهاتف مع رمز الدولة، مثل ‎+966501234567." },
  registration_date: { en: "Enter a valid date of birth that is not in the future.", ar: "أدخل تاريخ ميلاد صحيحًا لا يقع في المستقبل." },
  registration_gender: { en: "Select male or female.", ar: "اختر ذكرًا أو أنثى." },
  registration_text_type: { en: "Enter text in this field.", ar: "أدخل نصًا في هذا الحقل." },
  registration_children_limit: { en: "You can register at most 30 children at a time.", ar: "يمكن تسجيل 30 طفلًا كحد أقصى في المرة الواحدة." },
  registration_account_type: { en: "Select a supported account type.", ar: "اختر نوع حساب مدعومًا." },

  validation_password_length: {
    en: "Password must contain 8 to 128 characters.",
    ar: "يجب أن تتكون كلمة المرور من 8 إلى 128 حرفًا.",
  },
  validation_password_mismatch: {
    en: "Re-enter the same password in both fields.",
    ar: "أعد إدخال كلمة المرور نفسها في الحقلين.",
  },
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
  validation_invalid_format: {
    en: "The value format is invalid.",
    ar: "تنسيق القيمة غير صالح.",
  },
  validation_invalid_value: {
    en: "The selected value is not valid.",
    ar: "القيمة المحددة غير صالحة.",
  },
}

const META_ERROR_KEYS = new Set(["status", "message", "data", "details"])

/**
 * A "field map" is an object whose values are either strings or per-field
 * error objects (e.g. `{ email: { code, message } }`). We use it to tell
 * PocketBase field errors apart from the response envelope.
 */
function looksLikeFieldMap(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) return false
  if (entries.some(([key]) => META_ERROR_KEYS.has(key))) return false
  return entries.every(([, v]) => {
    if (typeof v === "string") return true
    return v !== null && typeof v === "object" && !Array.isArray(v)
  })
}

/**
 * Locate the field error map inside a PocketBase error. Depending on the SDK
 * version the map can live at `error.data` directly, or nested under
 * `error.data.data` / `error.data.details`.
 */
function getFieldErrorMap(error: unknown): Record<string, unknown> | undefined {
  if (!error || typeof error !== "object") return undefined
  const err = error as { data?: unknown; response?: unknown }
  const body = err.data ?? err.response
  if (!body || typeof body !== "object") return undefined

  const nested = [
    (body as { data?: unknown }).data,
    (body as { details?: unknown }).details,
  ]
  for (const candidate of nested) {
    if (looksLikeFieldMap(candidate)) return candidate
  }
  if (looksLikeFieldMap(body)) return body
  return undefined
}

function notUniqueMessage(field: string, lang: Lang): string {
  return t(
    {
      en: `This ${fieldLabel(field, "en")} is already in use.`,
      ar: `${fieldLabel(field, "ar")} مستخدم بالفعل.`,
    },
    lang
  )
}

function looksEnglish(value: string): boolean {
  return /^[\x00-\x7F\s]*$/.test(value)
}

/**
 * Translate a single field error (string or `{ code, message }` object) into a
 * friendly bilingual message, without leaking raw English server strings.
 */
function fieldErrorMessage(
  field: string,
  value: unknown,
  lang: Lang
): string | undefined {
  if (typeof value === "string") {
    const msg = value.trim()
    if (!msg) return undefined
    if (/unique/i.test(msg)) return notUniqueMessage(field, lang)
    if (field === "email" && /email/i.test(msg)) {
      return t(VALIDATION_CODE_MESSAGES.validation_email, lang)
    }
    const minMsg = minLengthMessage(field, msg, lang)
    if (minMsg) return minMsg
    if (lang === "ar" && looksEnglish(msg)) {
      return t({ en: "The value is invalid.", ar: "القيمة غير صالحة." }, lang)
    }
    return msg
  }

  if (!value || typeof value !== "object") return undefined
  const v = value as { code?: unknown; message?: unknown }
  const code = String(v.code ?? "")

  if (code === "validation_max_text_constraint" || code === "registration_max_length") {
    const maximum = String(v.message ?? "").match(
      /(?:no more than|at most)\s+(\d+)/i
    )?.[1]
    return maximum
      ? t(
          {
            en: `The maximum is ${maximum} characters.`,
            ar: `الحد الأقصى هو ${maximum} حرفًا.`,
          },
          lang
        )
      : t(
          {
            en: "The content exceeds this field's character limit.",
            ar: "المحتوى يتجاوز الحد الأقصى لأحرف هذا الحقل.",
          },
          lang
        )
  }

  if (code.includes("not_unique")) return notUniqueMessage(field, lang)

  const minMsg = minLengthMessage(field, v.message, lang)
  if (minMsg) return minMsg

  const mapped = VALIDATION_CODE_MESSAGES[code]
  if (mapped) return t(mapped, lang)

  if (typeof v.message === "string" && v.message.trim()) {
    const msg = v.message.trim()
    if (/unique/i.test(msg)) return notUniqueMessage(field, lang)
    if (field === "email" && /email/i.test(msg)) {
      return t(VALIDATION_CODE_MESSAGES.validation_email, lang)
    }
    if (lang === "ar" && looksEnglish(msg)) {
      return t({ en: "The value is invalid.", ar: "القيمة غير صالحة." }, lang)
    }
    return msg
  }
  return undefined
}

/**
 * Extract every field-level validation error from a PocketBase response as a
 * `{ field: message }` map. Returns an empty object for non-field errors.
 */
export function getFieldErrors(
  error: unknown,
  lang: Lang = getCurrentLang()
): Record<string, string> {
  const map = getFieldErrorMap(error)
  if (!map) return {}

  const result: Record<string, string> = {}
  for (const [field, value] of Object.entries(map)) {
    const message = fieldErrorMessage(field, value, lang)
    if (message) result[field] = message
  }
  return result
}

function getFieldValidationMessage(
  error: unknown,
  lang: Lang
): string | undefined {
  const messages = Object.entries(getFieldErrors(error, lang)).map(
    ([field, message]) => `${fieldLabel(field, lang)}: ${message}`
  )
  return messages.length ? messages.join("\n") : undefined
}

// Custom registration endpoints return actionable explanations in response.message.
function getRequestValidationMessage(
  error: unknown,
  lang: Lang
): string | undefined {
  const err = error as {
    response?: { message?: unknown }
    data?: { message?: unknown }
  } | null
  const message = err?.response?.message ?? err?.data?.message
  if (
    typeof message !== "string" ||
    !message.trim() ||
    /^(something went wrong|failed to .*|invalid request data)[.!]?$/i.test(
      message.trim()
    )
  )
    return undefined
  return lang === "ar"
    ? `تعذر إرسال الطلب. تفاصيل المشكلة: ${message.trim()}`
    : message.trim()
}

export function handlePocketBaseError(
  error: unknown,
  lang: Lang = getCurrentLang()
): string {
  const responseCode = (error as {response?:{code?:string}} | null)?.response?.code
  if (responseCode === "password_reset_email_unavailable") return t({en:"Password reset email is unavailable because the server email service is not configured. Contact the administrator.",ar:"تعذر إرسال رابط استعادة كلمة المرور لأن خدمة البريد غير معدّة على الخادم. تواصل مع المسؤول لإعدادها."},lang)
  const details = error as { message?: string; status?: number } | null
  if (details?.message?.includes("fetch")) {
    return t(
      {
        en: "PocketBase server is not accessible. Please check if the server is running.",
        ar: "تعذر الوصول إلى خادم PocketBase. يرجى التأكد من أن الخادم يعمل.",
      },
      lang
    )
  }
  if (details?.status === 400) {
    return (
      getFieldValidationMessage(error, lang) ??
      getRequestValidationMessage(error, lang) ??
      t(
        {
          en: "Invalid request data. Please check your input.",
          ar: "بيانات الطلب غير صالحة. يرجى التحقق من الإدخال.",
        },
        lang
      )
    )
  }
  if (details?.status === 401) {
    return t(
      {
        en: "Authentication required. Please log in.",
        ar: "مطلوب تسجيل الدخول. يرجى تسجيل الدخول.",
      },
      lang
    )
  }
  if (details?.status === 403) {
    return t(
      {
        en: "Access denied. You do not have permission to perform this action.",
        ar: "تم رفض الوصول. ليس لديك صلاحية لتنفيذ هذا الإجراء.",
      },
      lang
    )
  }
  if (details?.status === 404) {
    return t(
      {
        en: "Resource not found. The requested item may have been deleted.",
        ar: "العنصر غير موجود. ربما تم حذف العنصر المطلوب.",
      },
      lang
    )
  }
  if (details?.status === 422) {
    return t(
      {
        en: "Validation error. Please check your input data.",
        ar: "خطأ في التحقق من البيانات. يرجى مراجعة بيانات الإدخال.",
      },
      lang
    )
  }
  if (details?.status === 429) {
    return t(
      {
        en: "Too many attempts. Please try again later.",
        ar: "محاولات كثيرة. يرجى المحاولة لاحقًا.",
      },
      lang
    )
  }
  if ((details?.status ?? 0) >= 500) {
    return t(
      {
        en: "Server error. Please try again later.",
        ar: "خطأ في الخادم. يرجى المحاولة لاحقًا.",
      },
      lang
    )
  }

  const rawMessage =
    typeof details?.message === "string" ? details.message.trim() : ""
  const isMeaningfulMessage =
    rawMessage.length > 0 &&
    rawMessage !== "[object Object]" &&
    rawMessage !== "undefined" &&
    rawMessage !== "null"
  return isMeaningfulMessage
    ? rawMessage
    : t(
        {
          en: "An unexpected error occurred. Please try again.",
          ar: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        },
        lang
      )
}

export function getErrorMessage(error: unknown, lang?: Lang): string {
  return handlePocketBaseError(error, lang)
}

export default pb
