import type { BilingualString } from "@/types/form"

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const EMAIL_INVALID_MESSAGE: BilingualString = {
  en: "Please enter a valid email address.",
  ar: "يرجى إدخال بريد إلكتروني صحيح.",
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}
