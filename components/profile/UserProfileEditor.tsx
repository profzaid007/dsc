"use client"

import { Loader2, Mail, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateInput } from "@/components/ui/date-input"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import {
  ROLE_NOTES_LABEL,
  ROLE_PROFILE_SECTIONS,
  type ProfileField,
} from "@/lib/user-profile-fields"
import type { UserProfileDraft } from "@/hooks/useUserProfileRecord"
import type { AnyUserProfile } from "@/types/account-profile"
import type { User } from "@/types/user"

interface UserProfileEditorProps {
  user: User
  profile: AnyUserProfile | null
  draft: UserProfileDraft
  onChange: (next: UserProfileDraft) => void
  fieldErrors: Record<string, string>
  isSaving: boolean
  onCancel: () => void
  onSubmit: () => void
}

/**
 * Descriptor-driven editor for every role except experts, which reuse the
 * richer ExpertProfileEditor. Fields come from the same map that drives the
 * read-only view, so the two cannot drift.
 */
export function UserProfileEditor({
  user,
  profile,
  draft,
  onChange,
  fieldErrors,
  isSaving,
  onCancel,
  onSubmit,
}: UserProfileEditorProps) {
  const { lang } = useLang()
  const sections = ROLE_PROFILE_SECTIONS[user.role] ?? []
  const notesLabel = ROLE_NOTES_LABEL[user.role]

  const patchField = (field: string, value: string) =>
    onChange({
      ...draft,
      fields: { ...draft.fields, [field]: value },
    })

  const errorFor = (field: string) =>
    fieldErrors[field] ? (
      <p className="text-xs text-destructive">{fieldErrors[field]}</p>
    ) : null

  const renderInput = (field: ProfileField) => {
    const value = draft.fields[field.field] ?? ""

    if (field.input === "select" && field.options) {
      return (
        <Select value={value} onValueChange={(next) => patchField(field.field, next)}>
          <SelectTrigger
            id={`user-${field.field}`}
            aria-invalid={fieldErrors[field.field] ? true : undefined}
            className="w-full"
          >
            <SelectValue
              placeholder={t(
                { en: "Select...", ar: "اختر..." },
                lang
              )}
            />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-60!">
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label, lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.input === "date") {
      return (
        <DateInput
          id={`user-${field.field}`}
          value={value}
          onChange={(next) => patchField(field.field, next)}
          maxDate={new Date()}
        />
      )
    }

    if (field.input === "textarea") {
      return (
        <Textarea
          id={`user-${field.field}`}
          rows={3}
          value={value}
          onChange={(event) => patchField(field.field, event.target.value)}
        />
      )
    }

    return (
      <Input
        id={`user-${field.field}`}
        type={field.input === "url" ? "url" : "text"}
        value={value}
        aria-invalid={fieldErrors[field.field] ? true : undefined}
        onChange={(event) => patchField(field.field, event.target.value)}
      />
    )
  }

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {t({ en: "Edit Profile", ar: "تعديل الملف الشخصي" }, lang)}
        </h1>
        <p className="text-muted-foreground">
          {t(
            {
              en: `Update ${user.name}'s account and submitted details.`,
              ar: `حدّث بيانات الحساب والتفاصيل المُدخلة لـ ${user.name}.`,
            },
            lang
          )}
        </p>
      </div>

      {/* Account */}
      <Card className="gap-5 py-5 shadow-sm">
        <CardHeader>
          <CardTitle>{t({ en: "Account", ar: "الحساب" }, lang)}</CardTitle>
          <CardDescription>
            {t(
              { en: "Sign-in and access details", ar: "بيانات الدخول والوصول" },
              lang
            )}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="user-name">
              {t({ en: "Name", ar: "الاسم" }, lang)}
            </Label>
            <Input
              id="user-name"
              value={draft.name}
              aria-invalid={fieldErrors.name ? true : undefined}
              onChange={(event) =>
                onChange({ ...draft, name: event.target.value })
              }
            />
            {errorFor("name")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-contact">
              {t({ en: "Contact Number", ar: "رقم الاتصال" }, lang)}
            </Label>
            <Input
              id="user-contact"
              type="tel"
              value={draft.contactNumber}
              onChange={(event) =>
                onChange({ ...draft, contactNumber: event.target.value })
              }
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="user-email">
              {t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}
            </Label>
            <Input id="user-email" value={user.email} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              <Mail className="me-1 inline h-3 w-3" />
              {t(
                {
                  en: "The email is the login identity and cannot be edited here.",
                  ar: "البريد الإلكتروني هو هوية الدخول ولا يمكن تعديله هنا.",
                },
                lang
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Role specific sections */}
      {profile &&
        sections.map((section) => (
          <Card key={section.title.en} className="gap-5 py-5 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <section.icon className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle>{t(section.title, lang)}</CardTitle>
                  {section.description && (
                    <CardDescription>
                      {t(section.description, lang)}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div
                  key={field.field}
                  className={field.block ? "space-y-2 sm:col-span-2" : "space-y-2"}
                >
                  <Label htmlFor={`user-${field.field}`}>
                    {t(field.label, lang)}
                  </Label>
                  {renderInput(field)}
                  {errorFor(field.field)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

      {!profile && sections.length > 0 && (
        <Card className="py-5 shadow-sm">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            {t(
              {
                en: "This account has no submitted profile yet. Saving will create one.",
                ar: "لا يوجد ملف مُقدم لهذا الحساب بعد. سيُنشأ ملف عند الحفظ.",
              },
              lang
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {sections.length > 0 && (
        <Card className="gap-5 py-5 shadow-sm">
          <CardHeader>
            <CardTitle>
              {notesLabel
                ? t(notesLabel, lang)
                : t({ en: "Notes", ar: "ملاحظات" }, lang)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="user-notes" className="sr-only">
              {notesLabel
                ? t(notesLabel, lang)
                : t({ en: "Notes", ar: "ملاحظات" }, lang)}
            </Label>
            <Textarea
              id="user-notes"
              rows={5}
              value={draft.notes}
              onChange={(event) =>
                onChange({ ...draft, notes: event.target.value })
              }
            />
            {errorFor("notes")}
          </CardContent>
        </Card>
      )}

      <Card className="sticky bottom-4 gap-0 py-3 shadow-lg">
        <CardFooter className="justify-end gap-2 p-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            {t({ en: "Cancel", ar: "إلغاء" }, lang)}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="me-2 h-4 w-4" />
            )}
            {isSaving
              ? t({ en: "Saving...", ar: "جارٍ الحفظ..." }, lang)
              : t({ en: "Save Changes", ar: "حفظ التغييرات" }, lang)}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

