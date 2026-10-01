import type { UserRole } from "@/types/user"

interface ProfileRecordBase {
  id: string
  user: string
  created?: string
  updated?: string
}

export interface IndividualProfile extends ProfileRecordBase {
  gender?: string
  date_of_birth?: string
  country_of_residence?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  notes?: string
}

export interface ParentProfile extends ProfileRecordBase {
  country_of_residence?: string
  notes?: string
}

export interface OrganizationProfile extends ProfileRecordBase {
  organization_name?: string
  organization_type?: string
  country?: string
  city?: string
  website?: string
  responsible_person_name?: string
  responsible_person_title?: string
  responsible_person_phone?: string
  notes?: string
}

/**
 * The collection holding a role's submitted details. Admin accounts are created
 * directly and have no profile collection.
 */
export const ROLE_PROFILE_COLLECTION: Partial<Record<UserRole, string>> = {
  individual: "individual_profiles",
  parent: "parent_profiles",
  organization: "organization_profiles",
  expert: "expert_profiles",
}

export type AnyUserProfile =
  | IndividualProfile
  | ParentProfile
  | OrganizationProfile