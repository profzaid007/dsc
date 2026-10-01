"use client"

import {
  BookOpen,
  Briefcase,
  CalendarClock,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageSquareText,
  Paperclip,
  Pencil,
  Phone,
  User as UserIcon,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/format-date"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { ageGroupLabel, consultationModeLabel } from "@/lib/expert-options"
import {
  degreeLabel,
  specializationLabel,
} from "@/components/team/team-labels"
import { ExpertAvatar } from "@/components/expert/ExpertAvatar"
import {
  profileFileUrl,
  profilePhotoName,
  toStringList,
} from "@/hooks/useExpertProfile"
import type { ExpertProfile } from "@/types/expert"

const EMPTY_DASH = "—"

function text(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return ""
}

/** An empty value renders as a muted dash rather than collapsing the row. */
function dash(value: string): string {
  return value.trim() ? value : EMPTY_DASH
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium break-words">{children}</div>
      </div>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="gap-5 py-5 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-5 sm:grid-cols-2">{children}</CardContent>
    </Card>
  )
}

function TagList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="text-muted-foreground">{EMPTY_DASH}</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((item) => (
        <Badge key={item} variant="secondary" className="font-normal">
          {item}
        </Badge>
      ))}
    </div>
  )
}

interface ExpertProfileViewProps {
  name: string
  email: string
  profile: ExpertProfile | null
  fileToken: string
  onEdit?: () => void
}

export function ExpertProfileView({
  name,
  email,
  profile,
  fileToken,
  onEdit,
}: ExpertProfileViewProps) {
  const { lang } = useLang()

  const fileUrl = (filename: string) =>
    profileFileUrl(profile, filename, fileToken)

  const photo = profilePhotoName(profile)
  const photoUrl = profileFileUrl(profile, photo, fileToken)
  const cvFiles = toStringList(profile?.cv)
  // Stored values may be enum keys or free text, so resolve through the label
  // map and fall back for genuine prose. Kept as raw/display pairs so React
  // keys stay unique even when two stored values share a label.
  const specializationEntries = toStringList(profile?.specialization_type).map(
    (value) => ({ raw: value, label: specializationLabel(value, lang) })
  )
  const specializationLabels = specializationEntries.map((item) => item.label)
  const degree = text(profile?.highest_academic_degree)
  const consultationMode = text(profile?.consultation_mode)
  const city = text(profile?.city)
  const country = text(profile?.country_of_residence)
  const whatsapp = text(profile?.whatsapp_number)
  const whatsappCode = text(profile?.whatsapp_country_code)
  const location = [city, country].filter(Boolean).join(", ")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {t({ en: "My Profile", ar: "ملفي الشخصي" }, lang)}
          </h1>
          <p className="text-muted-foreground">
            {t(
              {
                en: "Review the details you submitted when you applied.",
                ar: "راجع البيانات التي أدخلتها عند التقديم.",
              },
              lang
            )}
          </p>
        </div>
        {onEdit && (
          <Button onClick={onEdit}>
            <Pencil className="me-2 h-4 w-4" />
            {t({ en: "Edit Profile", ar: "تعديل الملف" }, lang)}
          </Button>
        )}
      </div>

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 shadow-lg md:p-8"
        style={{ background: "var(--dsc-gradient)" }}
      >
        <div
          aria-hidden
          className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-black/10 blur-2xl"
        />
        <div className="relative flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:gap-7 md:text-start">
          <ExpertAvatar
            photoUrl={photoUrl}
            name={name}
            className="h-28 w-28 shrink-0 md:h-32 md:w-32"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              {name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-white/85 md:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {email}
              </span>
              {location && (
                <>
                  <span aria-hidden className="opacity-50">
                    |
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                </>
              )}
            </div>

            {(degree || text(profile?.field_of_study)) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  {degree ? degreeLabel(degree, lang) : ""}
                  {text(profile?.field_of_study)
                    ? ` · ${text(profile?.field_of_study)}`
                    : ""}
                </span>
              </div>
            )}

            {specializationEntries.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
                {specializationEntries.map((item) => (
                  <span
                    key={item.raw}
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: "var(--dsc-gold)" }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            )}

            {profile?.created && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/75">
                <CalendarClock className="h-3.5 w-3.5" />
                {t({ en: "Member since", ar: "عضو منذ" }, lang)}{" "}
                {formatDate(profile.created)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact */}
      <SectionCard
        icon={UserIcon}
        title={t({ en: "Personal & Contact", ar: "البيانات الشخصية والتواصل" }, lang)}
        description={t(
          { en: "How clients can reach you", ar: "كيف يمكن للعملاء التواصل معك" },
          lang
        )}
      >
        <InfoRow
          icon={Mail}
          label={t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}
        >
          {email}
        </InfoRow>
        <InfoRow
          icon={Globe}
          label={t({ en: "Country of Residence", ar: "بلد الإقامة" }, lang)}
        >
          {dash(country)}
        </InfoRow>
        <InfoRow
          icon={MapPin}
          label={t({ en: "City", ar: "المدينة" }, lang)}
        >
          {dash(city)}
        </InfoRow>
        <InfoRow
          icon={Phone}
          label={t({ en: "WhatsApp Number", ar: "رقم الواتساب" }, lang)}
        >
          {whatsapp
            ? `${whatsappCode ? `${whatsappCode} ` : ""}${whatsapp}`
            : t({ en: EMPTY_DASH, ar: EMPTY_DASH }, lang)}
        </InfoRow>
      </SectionCard>

      {/* Academic */}
      <SectionCard
        icon={GraduationCap}
        title={t({ en: "Academic Background", ar: "الخلفية العلمية" }, lang)}
        description={t(
          { en: "Your qualifications", ar: "مؤهلاتك العلمية" },
          lang
        )}
      >
        <InfoRow
          icon={GraduationCap}
          label={t(
            { en: "Highest Academic Degree", ar: "أعلى مؤهل أكاديمي" },
            lang
          )}
        >
          {degree ? degreeLabel(degree, lang) : t({ en: EMPTY_DASH, ar: EMPTY_DASH }, lang)}
        </InfoRow>
        <InfoRow
          icon={BookOpen}
          label={t({ en: "Degree Title", ar: "عنوان الشهادة" }, lang)}
        >
          {dash(text(profile?.degree_title))}
        </InfoRow>
        <InfoRow
          icon={BookOpen}
          label={t({ en: "Field of Study", ar: "مجال الدراسة" }, lang)}
        >
          {dash(text(profile?.field_of_study))}
        </InfoRow>
      </SectionCard>

      {/* Professional */}
      <SectionCard
        icon={Briefcase}
        title={t({ en: "Professional Details", ar: "البيانات المهنية" }, lang)}
        description={t(
          {
            en: "What you offer and when you are available",
            ar: "ما تقدمه ومتى تكون متاحاً",
          },
          lang
        )}
      >
        <InfoRow
          icon={UserIcon}
          label={t({ en: "Field of Service Provision", ar: "مجال تقديم الخدمات" }, lang)}
        >
          {specializationLabels.length > 0 ? (
            specializationLabels.join(", ")
          ) : (
            <span className="text-muted-foreground">{EMPTY_DASH}</span>
          )}
        </InfoRow>
        <InfoRow
          icon={UserIcon}
          label={t({ en: "Age Group", ar: "الفئة العمرية" }, lang)}
        >
          <TagList
            values={toStringList(profile?.age_group).map((item) =>
              ageGroupLabel(item, lang)
            )}
          />
        </InfoRow>
        <InfoRow
          icon={Globe}
          label={t({ en: "Consultation Mode", ar: "وضع الاستشارة" }, lang)}
        >
          {consultationMode
            ? consultationModeLabel(consultationMode, lang)
            : t({ en: EMPTY_DASH, ar: EMPTY_DASH }, lang)}
        </InfoRow>
        <InfoRow
          icon={Wallet}
          label={t({ en: "First Session Fee", ar: "رسوم الجلسة الأولى" }, lang)}
        >
          {dash(text(profile?.fee))}
        </InfoRow>
        <InfoRow
          icon={CalendarClock}
          label={t({ en: "Availability", ar: "أوقات التوفر" }, lang)}
        >
          {dash(text(profile?.availability))}
        </InfoRow>
        <InfoRow
          icon={Briefcase}
          label={t({ en: "Documents", ar: "المستندات" }, lang)}
        >
          {cvFiles.length === 0 ? (
            <span className="text-muted-foreground">{EMPTY_DASH}</span>
          ) : (
            <div className="flex flex-col gap-1.5">
              {cvFiles.map((filename) => (
                <a
                  key={filename}
                  href={fileUrl(filename)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{filename}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                </a>
              ))}
            </div>
          )}
        </InfoRow>
      </SectionCard>

      {/* About */}
      <Card className="gap-4 py-5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquareText className="h-4 w-4" />
            </span>
            <CardTitle>
              {t({ en: "About Me", ar: "نبذة عني" }, lang)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {text(profile?.bio).trim() ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {text(profile?.bio)}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t(
                  {
                    en: "You have not added a message yet.",
                    ar: "لم تقم بإضافة رسالة بعد.",
                  },
                  lang
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {photo && (
        <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
          <a
            href={photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {t({ en: "View full-size photo", ar: "عرض الصورة بالحجم الكامل" }, lang)}
          </a>
        </p>
      )}
    </div>
  )
}