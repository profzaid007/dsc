"use client"

import { FileText, Mail, MapPin, Pencil, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { formatDate } from "@/lib/format-date"
import {
  dash,
  fieldText as text,
  InfoRow,
  ProfileHero,
  SectionCard,
} from "@/components/profile/ProfilePrimitives"
import {
  ACCOUNT_SECTION,
  formatFieldValue,
  ROLE_LABELS,
  ROLE_NOTES_LABEL,
  ROLE_PROFILE_SECTIONS,
  type ProfileField,
} from "@/lib/user-profile-fields"
import type { AnyUserProfile } from "@/types/account-profile"
import type { User } from "@/types/user"

/** Strips the protocol so a bare host still renders as a working link. */
function linkHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

/**
 * Read-only profile for any account, rendering whatever fields the user's role
 * actually collected. Expert accounts reuse their own richer view; everything
 * else is driven by the descriptor map in lib/user-profile-fields.
 */
export function UserProfileView({
  user,
  profile,
  onEdit,
}: {
  user: User
  profile: AnyUserProfile | null
  /** Renders an edit control in the hero; omitted when the view is read-only. */
  onEdit?: () => void
}) {
  const { lang } = useLang()

  // Account values live on the user row, role details on the profile record.
  const accountSource: Record<string, unknown> = {
    name: user.name,
    email: user.email,
    contact_number: user.contact_number,
    created: user.created,
  }

  const sections = ROLE_PROFILE_SECTIONS[user.role] ?? []
  const roleSource = (profile ?? {}) as unknown as Record<string, unknown>
  const notes = text(profile?.notes).trim()
  const notesLabel = ROLE_NOTES_LABEL[user.role]

  const renderRoleField = (field: ProfileField) => {
    const value = formatFieldValue(text(roleSource[field.field]), field.format, lang)
    if (field.format === "url" && value) {
      return (
        <a
          href={linkHref(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {value}
        </a>
      )
    }
    return dash(value)
  }

  const locationBits = [
    text(profile && "city" in profile ? profile.city : "").trim(),
    text(profile && "country" in profile ? profile.country : "").trim(),
    text(profile && "country_of_residence" in profile ? profile.country_of_residence : "").trim(),
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <ProfileHero
        name={user.name}
        action={
          onEdit ? (
            <Button
              onClick={onEdit}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Pencil className="me-2 h-4 w-4" />
              {t({ en: "Edit Profile", ar: "تعديل الملف" }, lang)}
            </Button>
          ) : undefined
        }
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </span>
            {text(user.contact_number).trim() && (
              <>
                <span aria-hidden className="opacity-50">
                  |
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />
                  {text(user.contact_number).trim()}
                </span>
              </>
            )}
            {locationBits.length > 0 && (
              <>
                <span aria-hidden className="opacity-50">
                  |
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {locationBits.join(", ")}
                </span>
              </>
            )}
          </>
        }
        chip={
          text(
            profile && "organization_name" in profile ? profile.organization_name : ""
          )
        }
        footer={
          <p className="inline-flex items-center gap-1.5 text-xs text-white/75">
            <UserRound className="h-3.5 w-3.5" />
            {t({ en: "Member since", ar: "عضو منذ" }, lang)}{" "}
            {formatDate(user.created)}
          </p>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-[var(--dsc-gold)] text-white hover:bg-[var(--dsc-gold)]">
          {ROLE_LABELS[user.role]?.[lang] ?? user.role}
        </Badge>
        <Badge
          variant="outline"
          className={
            user.is_active
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }
        >
          {user.is_active
            ? t({ en: "Active", ar: "نشط" }, lang)
            : t({ en: "Inactive", ar: "غير نشط" }, lang)}
        </Badge>
      </div>

      <SectionCard
        icon={ACCOUNT_SECTION.icon}
        title={t(ACCOUNT_SECTION.title, lang)}
        description={
          ACCOUNT_SECTION.description
            ? t(ACCOUNT_SECTION.description, lang)
            : undefined
        }
      >
        {ACCOUNT_SECTION.fields.map((field) => (
          <InfoRow key={field.field} icon={field.icon} label={t(field.label, lang)}>
            {field.format === "date"
              ? dash(text(accountSource[field.field]) ? formatDate(text(accountSource[field.field])) : "")
              : dash(text(accountSource[field.field]))}
          </InfoRow>
        ))}
      </SectionCard>

      {/* A missing profile record is omitted rather than shown as empty rows. */}
      {profile &&
        sections.map((section) => (
          <SectionCard
            key={section.title.en}
            icon={section.icon}
            title={t(section.title, lang)}
            description={
              section.description ? t(section.description, lang) : undefined
            }
          >
            {section.fields.map((field) => (
              <InfoRow key={field.field} icon={field.icon} label={t(field.label, lang)}>
                {renderRoleField(field)}
              </InfoRow>
            ))}
          </SectionCard>
        ))}

      {notes && (
        <Card className="gap-4 py-5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <CardTitle>
                {notesLabel
                  ? t(notesLabel, lang)
                  : t({ en: "Notes", ar: "ملاحظات" }, lang)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{notes}</p>
          </CardContent>
        </Card>
      )}

      {!profile && sections.length > 0 && (
        <Card className="py-5 shadow-sm">
          <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t(
                {
                  en: "No profile details were submitted for this account.",
                  ar: "لم يتم تقديم أي تفاصيل ملف لهذا الحساب.",
                },
                lang
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {!profile && sections.length === 0 && (
        <Card className="py-5 shadow-sm">
          <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t(
                {
                  en: "This account type has no submitted profile.",
                  ar: "لا يوجد ملف مُقدم لهذا نوع الحساب.",
                },
                lang
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}