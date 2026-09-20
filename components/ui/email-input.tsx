"use client"

import * as React from "react"
import { CircleCheck } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { EMAIL_INVALID_MESSAGE, isValidEmail } from "@/lib/validators"

interface EmailInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value: string
  onChange: (value: string) => void
  /** Server-side or external error message. Takes priority over live validation. */
  error?: string
  /** Disable the live client-side validation UI (default: enabled). */
  showValidation?: boolean
}

export function EmailInput({
  value,
  onChange,
  error,
  showValidation = true,
  className,
  onBlur,
  ...props
}: EmailInputProps) {
  const { lang } = useLang()
  const [touched, setTouched] = React.useState(false)

  // External errors (e.g. "already in use") are dismissed as soon as the user
  // edits the field again, and re-shown when a new error arrives.
  const [lastError, setLastError] = React.useState(error)
  const [dirtySinceError, setDirtySinceError] = React.useState(false)
  if (error !== lastError) {
    setLastError(error)
    setDirtySinceError(false)
  }

  const trimmed = value.trim()
  const isValid = isValidEmail(trimmed)
  const activeError = dirtySinceError ? "" : error || ""
  const showInvalid =
    !activeError && showValidation && touched && trimmed.length > 0 && !isValid
  const showCheck =
    !activeError && showValidation && trimmed.length > 0 && isValid
  const message =
    activeError || (showInvalid ? t(EMAIL_INVALID_MESSAGE, lang) : "")

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          {...props}
          type="email"
          dir="ltr"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          aria-invalid={message ? true : undefined}
          onChange={(e) => {
            setDirtySinceError(true)
            onChange(e.target.value.toLowerCase())
          }}
          onBlur={(e) => {
            setTouched(true)
            const cleaned = e.target.value.toLowerCase().trim()
            if (cleaned !== e.target.value) onChange(cleaned)
            onBlur?.(e)
          }}
          className={cn("text-left", showCheck && "pr-8", className)}
        />
        {showCheck && (
          <CircleCheck className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
        )}
      </div>
      {message && <p className="text-xs text-red-500">{message}</p>}
    </div>
  )
}
