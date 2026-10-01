import {
  Baby,
  BookOpen,
  Building2,
  Globe,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  User as UserIcon,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { BilingualString, Lang } from "@/types/form"
import { formatDate } from "@/lib/format-date"
import { organizationTypeLabel } from "@/lib/organization-types"
import type { UserRole } from "@/types/user"

/** How a stored value should be rendered in a profile row. */
export type FieldFormat =
  | "text"
  | "date"
  | "gender"
  | "organizationType"
  | "url"

export interface ProfileField {
  /** Key on the stored profile record. */
  field: string
  label: BilingualString
  icon: LucideIcon
  format?: FieldFormat
  /** Rendered in a full-width block instead of a grid row. */
  block?: boolean
}

export interface ProfileSection {
  icon: LucideIcon
  title: BilingualString
  description?: BilingualString
  fields: ProfileField[]
}

const GENDERS: Record<string, BilingualString> = {
  male: { en: "Male", ar: "ذكر" },
  female: { en: "Female", ar: "أنثى" },
}

/** Applies a field's formatter to a raw stored value. */
export function formatFieldValue(
  value: string,
  format: FieldFormat | undefined,
  lang: Lang
): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  switch (format) {
    case "date":
      return formatDate(trimmed)
    case "gender":
      return GENDERS[trimmed]?.[lang] ?? trimmed
    case "organizationType":
      return organizationTypeLabel(trimmed, lang)
    default:
      return trimmed
  }
}

/** Fields every account has, regardless of role. */
export const ACCOUNT_SECTION: ProfileSection = {
  icon: Shield,
  title: { en: "Account", ar: "الحساب" },
  description: { en: "Sign-in and access details", ar: "بيانات الدخول والوصول" },
  fields: [
    { field: "name", label: { en: "Name", ar: "الاسم" }, icon: UserIcon },
    { field: "email", label: { en: "Email", ar: "البريد الإلكتروني" }, icon: Mail },
    {
      field: "contact_number",
      label: { en: "Contact Number", ar: "رقم الاتصال" },
      icon: Phone,
    },
    {
      field: "created",
      label: { en: "Registered", ar: "تاريخ التسجيل" },
      icon: IdCard,
      format: "date",
    },
  ],
}

const ORGANIZATION_SECTION: ProfileSection = {
  icon: Building2,
  title: { en: "Organization", ar: "المنشأة" },
  description: { en: "Legal and contact details", ar: "البيانات القانونية ووسائل التواصل" },
  fields: [
    {
      field: "organization_name",
      label: { en: "Organization Name", ar: "اسم المنشأة" },
      icon: Building2,
    },
    {
      field: "organization_type",
      label: { en: "Organization Type", ar: "نوع المنشأة" },
      icon: Sparkles,
      format: "organizationType",
    },
    { field: "city", label: { en: "City", ar: "المدينة" }, icon: MapPin },
    { field: "country", label: { en: "Country", ar: "الدولة" }, icon: Globe },
    {
      field: "website",
      label: { en: "Website", ar: "الموقع الإلكتروني" },
      icon: Globe,
      format: "url",
    },
  ],
}

const RESPONSIBLE_PERSON_SECTION: ProfileSection = {
  icon: Users,
  title: { en: "Responsible Person", ar: "المسؤول" },
  description: {
    en: "Primary point of contact",
    ar: "جهة الاتصال الرئيسية",
  },
  fields: [
    {
      field: "responsible_person_name",
      label: { en: "Full Name", ar: "الاسم الكامل" },
      icon: UserIcon,
    },
    {
      field: "responsible_person_title",
      label: { en: "Job Title", ar: "المسمى الوظيفي" },
      icon: IdCard,
    },
    {
      field: "responsible_person_phone",
      label: { en: "Phone", ar: "الهاتف" },
      icon: Phone,
    },
  ],
}

const INDIVIDUAL_SECTION: ProfileSection = {
  icon: UserIcon,
  title: { en: "Personal Details", ar: "البيانات الشخصية" },
  description: {
    en: "Submitted during registration",
    ar: "البيانات المُدخلة عند التسجيل",
  },
  fields: [
    {
      field: "gender",
      label: { en: "Gender", ar: "الجنس" },
      icon: UserIcon,
      format: "gender",
    },
    {
      field: "date_of_birth",
      label: { en: "Date of Birth", ar: "تاريخ الميلاد" },
      icon: Baby,
      format: "date",
    },
    {
      field: "country_of_residence",
      label: { en: "Country of Residence", ar: "بلد الإقامة" },
      icon: Globe,
    },
  ],
}

const EMERGENCY_SECTION: ProfileSection = {
  icon: Phone,
  title: { en: "Emergency Contact", ar: "جهة الاتصال للطوارئ" },
  description: {
    en: "Who to call in an emergency",
    ar: "من يُتصل به في حالات الطوارئ",
  },
  fields: [
    {
      field: "emergency_contact_name",
      label: { en: "Contact Name", ar: "اسم جهة الاتصال" },
      icon: Users,
    },
    {
      field: "emergency_contact_phone",
      label: { en: "Contact Number", ar: "رقم الاتصال" },
      icon: Phone,
    },
  ],
}

const PARENT_SECTION: ProfileSection = {
  icon: Users,
  title: { en: "Household", ar: "الأسرة" },
  description: {
    en: "Submitted during registration",
    ar: "البيانات المُدخلة عند التسجيل",
  },
  fields: [
    {
      field: "country_of_residence",
      label: { en: "Country of Residence", ar: "بلد الإقامة" },
      icon: Globe,
    },
  ],
}

/**
 * Role-specific sections shown after the shared account block. Roles absent
 * from this map (admins) have no submitted profile of their own.
 */
export const ROLE_PROFILE_SECTIONS: Partial<
  Record<UserRole, ProfileSection[]>
> = {
  individual: [INDIVIDUAL_SECTION, EMERGENCY_SECTION],
  parent: [PARENT_SECTION],
  organization: [ORGANIZATION_SECTION, RESPONSIBLE_PERSON_SECTION],
}

/** The notes column each role's profile collection writes to. */
export const ROLE_NOTES_LABEL: Partial<Record<UserRole, BilingualString>> = {
  individual: { en: "Notes", ar: "ملاحظات" },
  parent: { en: "Notes", ar: "ملاحظات" },
  organization: { en: "Notes", ar: "ملاحظات" },
}

export const ROLE_LABELS: Record<UserRole, BilingualString> = {
  admin: { en: "Admin", ar: "مشرف" },
  individual: { en: "Individual", ar: "فرد" },
  parent: { en: "Parent", ar: "ولي أمر" },
  organization: { en: "Organization", ar: "منظمة" },
  expert: { en: "Expert", ar: "خبير" },
  super_admin: { en: "Super Admin", ar: "مشرف عام" },
}

/** Icons reused by the hero for each role. */
export const ROLE_ICONS: Record<UserRole, LucideIcon> = {
  admin: Shield,
  individual: UserIcon,
  parent: Users,
  organization: Building2,
  expert: BookOpen,
  super_admin: Shield,
}