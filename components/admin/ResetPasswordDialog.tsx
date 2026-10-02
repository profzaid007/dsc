"use client"

import { useState } from "react"
import { Check, Copy, KeyRound, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { getErrorMessage, getFieldErrors } from "@/lib/pb"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import type { User } from "@/types/user"

/** PocketBase's default minimum for auth collection passwords. */
const MIN_PASSWORD_LENGTH = 8

const MIN_LENGTH_MESSAGE = {
  en: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  ar: `استخدم ${MIN_PASSWORD_LENGTH} أحرف على الأقل.`,
}

/**
 * Builds a readable random password. Avoids characters that are easy to
 * misread aloud or retype, since the admin will be reading this over the phone.
 */
function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const symbols = "!@#$%^&*?"
  const all = upper + lower + digits + symbols

  // getRandomValues can return a byte >= the range, so redraw rather than
  // taking a modulo, which would bias the first characters of the alphabet.
  const randomInt = (bound: number) => {
    const max = Math.floor(256 / bound) * bound
    let value: number
    do {
      value = crypto.getRandomValues(new Uint8Array(1))[0]
    } while (value >= max)
    return value % bound
  }

  const groups = [upper, lower, digits, symbols]
  const chars = groups.map((group) => group[randomInt(group.length)])
  for (let i = chars.length; i < 16; i++) chars.push(all[randomInt(all.length)])

  // Fisher-Yates so the guaranteed classes are not always in the same order.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    const swap = chars[i]
    chars[i] = chars[j]
    chars[j] = swap
  }
  return chars.join("")
}

interface ResetPasswordDialogProps {
  user: User | null
  open: boolean
  isSaving: boolean
  onClose: () => void
  onSubmit: (password: string) => Promise<void>
}

/**
 * Admin-side password reset. The plaintext is chosen here rather than emailed,
 * so the admin must pass it to the user themselves.
 */
export function ResetPasswordDialog({
  user,
  open,
  isSaving,
  onClose,
  onSubmit,
}: ResetPasswordDialogProps) {
  const { lang } = useLang()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const reset = () => {
    setPassword("")
    setConfirm("")
    setError("")
    setFieldErrors({})
    setCopied(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset()
      onClose()
    }
  }

  const handleGenerate = () => {
    const generated = generatePassword()
    setPassword(generated)
    setConfirm(generated)
    setError("")
    setFieldErrors({})
    // Best-effort: the admin can always select and copy it manually.
    navigator.clipboard?.writeText(generated).then(
      () => setCopied(true),
      () => setCopied(false)
    )
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(password).then(
      () => setCopied(true),
      () =>
        setError(
          t(
            {
              en: "Could not copy automatically. Select the password and copy it manually.",
              ar: "تعذّر النسخ تلقائياً. حدد كلمة المرور وانسخها يدوياً.",
            },
            lang
          )
        )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFieldErrors({ password: t(MIN_LENGTH_MESSAGE, lang) })
      return
    }
    if (password !== confirm) {
      setFieldErrors({
        confirm: t(
          { en: "The two passwords do not match.", ar: "كلمتا المرور غير متطابقتين." },
          lang
        ),
      })
      return
    }

    try {
      await onSubmit(password)
      reset()
    } catch (err) {
      const errors = getFieldErrors(err, lang)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
      } else {
        setError(
          getErrorMessage(err, lang) ||
            t(
              {
                en: "Failed to reset the password. Please try again.",
                ar: "تعذّر تغيير كلمة المرور. يرجى المحاولة مرة أخرى.",
              },
              lang
            )
        )
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {t({ en: "Reset password", ar: "تغيير كلمة المرور" }, lang)}
          </DialogTitle>
          <DialogDescription>
            {user
              ? t(
                  {
                    en: `Set a new password for ${user.name} (${user.email}). Share it with them directly — it is not emailed.`,
                    ar: `عيّن كلمة مرور جديدة لـ ${user.name} (${user.email}). شاركها معهم مباشرة، فهي لن تُرسل بالبريد.`,
                  },
                  lang
                )
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="reset-password">
                {t({ en: "New password", ar: "كلمة المرور الجديدة" }, lang)}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isSaving}
              >
                {copied ? (
                  <Check className="me-1.5 h-3.5 w-3.5" />
                ) : (
                  <Copy className="me-1.5 h-3.5 w-3.5" />
                )}
                {t({ en: "Generate", ar: "توليد" }, lang)}
              </Button>
            </div>
            <PasswordInput
              id="reset-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={fieldErrors.password ? true : undefined}
              disabled={isSaving}
              required
            />
            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
            {copied && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Copy className="h-3 w-3" />
                {t(
                  { en: "Copied to your clipboard.", ar: "تم النسخ إلى الحافظة." },
                  lang
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password-confirm">
              {t({ en: "Confirm new password", ar: "تأكيد كلمة المرور" }, lang)}
            </Label>
            <PasswordInput
              id="reset-password-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={fieldErrors.confirm ? true : undefined}
              disabled={isSaving}
              required
            />
            {fieldErrors.confirm && (
              <p className="text-xs text-destructive">{fieldErrors.confirm}</p>
            )}
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            {t(
              {
                en: "The previous password stops working immediately. Any sessions already open on other devices stay signed in.",
                ar: "كلمة المرور السابقة تتوقف عن العمل فوراً. أما الجلسات المفتوحة على أجهزة أخرى فتبقى مسجّلة الدخول.",
              },
              lang
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              {t({ en: "Cancel", ar: "إلغاء" }, lang)}
            </Button>
            {password && (
              <Button type="button" variant="ghost" onClick={handleCopy} disabled={isSaving}>
                {t({ en: "Copy", ar: "نسخ" }, lang)}
              </Button>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isSaving
                ? t({ en: "Saving...", ar: "جارٍ الحفظ..." }, lang)
                : t({ en: "Reset password", ar: "تغيير كلمة المرور" }, lang)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}