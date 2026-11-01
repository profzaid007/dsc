import type { ExpertProfile } from "@/types/expert"
import type { RolesManagement } from "@/types/expert-role"
import type { User } from "@/types/user"
import { personName } from "./person-name"
import { COUNTRY_CODES } from "./country-codes"
import { countryLabel } from "./expert-options"
import { specializationLabel } from "@/components/team/team-labels"
import { toStringList } from "./expert-list-fields"

export function searchText(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").trim().toLocaleLowerCase()
}
export function allocationExpertDirectory(users: Pick<User, "id" | "role" | "is_active" | "name" | "email">[], profiles: ExpertProfile[], roles: RolesManagement[], lang: "ar" | "en") {
  return users.filter(user => user.role === "expert" && user.is_active).map(user => {
    const profile = profiles.find(item => item.user === user.id)
    const linkedRoles = roles.filter(role => profile?.specialist_roles?.includes(role.id))
    const services = toStringList(profile?.specialization_type)
    const rawCountry = profile?.country_of_residence || ""
    const country = COUNTRY_CODES.find(item => [item.value, item.label.ar, item.label.en].some(value => searchText(value) === searchText(rawCountry)))?.value || rawCountry
    const specialty = lang === "ar" ? profile?.public_specialty_ar || profile?.public_specialty_en : profile?.public_specialty_en || profile?.public_specialty_ar
    return {
      id: user.id, name: personName({ ...profile, name: user.name }, lang), email: user.email,
      country: countryLabel(country, lang), city: profile?.city || "",
      specialty: specialty || linkedRoles.map(role => (lang === "ar" ? role.role_name_ar : role.role_name_en) || role.role_name_en || role.role_name_ar).join("، ") || services.map(value => specializationLabel(value, lang)).join("، "),
      search: {
        country: searchText([country, countryLabel(country, "ar"), countryLabel(country, "en")].join(" ")),
        city: searchText(profile?.city || ""),
        specialty: searchText([profile?.public_specialty_ar, profile?.public_specialty_en, ...linkedRoles.flatMap(role => [role.role_name_ar, role.role_name_en]), ...services.flatMap(value => [value, specializationLabel(value, "ar"), specializationLabel(value, "en")])].filter(Boolean).join(" ")),
      },
    }
  })
}
export type AllocationExpertChoice = ReturnType<typeof allocationExpertDirectory>[number]
export function filterAllocationExperts(experts: AllocationExpertChoice[], filters: { country: string; city: string; specialty: string }) {
  const query = { country: searchText(filters.country), city: searchText(filters.city), specialty: searchText(filters.specialty) }
  return experts.filter(expert => (Object.keys(query) as (keyof typeof query)[]).every(key => !query[key] || expert.search[key].includes(query[key])))
}
