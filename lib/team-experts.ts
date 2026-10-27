import { boundedFullList } from "@/lib/bounded-records"
import pb from "@/lib/pb"
import { normalizeAllocationRole } from "./allocation-role-groups"
import type { RolesManagement } from "@/types/expert-role"
import type { TeamExpert } from "@/types/team"
import { applyExpertOrder, readExpertOrder } from "./expert-display-order"

interface ExpertProfileRecord {
  id: string
  user?: string
  full_legal_name?: string
  profile_photo?: string
  specialization_type?: unknown
  specialist_roles?: unknown
  highest_academic_degree?: string
  field_of_study?: string
  bio?: string
  public_name_en?: string
  public_name_ar?: string
  public_qualification_en?: string
  public_qualification_ar?: string
  public_specialty_en?: string
  public_specialty_ar?: string
  short_bio_en?: string
  short_bio_ar?: string
  name?: string
  degree_title?: string
}

const MAX_EXPERTS = 6

import { toStringList, recordStringArray } from "./expert-list-fields"

export async function getTeamExperts({
  all = false,
}: { all?: boolean; throwOnError?: boolean } = {}): Promise<TeamExpert[]> {
  async function read<T>(collection: string, load: () => Promise<T>): Promise<T> {
    try { return await load() }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`${collection} at ${pb.baseURL}: ${message}. Verify that this backend has the required collection/view and public read rules.`)
    }
  }
  try {
    const [records, order, specialistRoles] = await Promise.all([
      read("experts_public", () => boundedFullList(pb.collection("experts_public"), { sort: "name" })),
      read("expert_display_settings", () => readExpertOrder()),
      read("expert_roles_public", () => boundedFullList<RolesManagement>(pb.collection("expert_roles_public"))),
    ])

    const roleGroups = new Map(specialistRoles.map(role => [role.id, normalizeAllocationRole(role).role_group]))

    return applyExpertOrder(records as unknown as ExpertProfileRecord[], order)
      .slice(0, all ? undefined : MAX_EXPERTS)
      .map((record) => {
        const filename = record.profile_photo
        return {
          id: record.id,
          name: record.name || record.full_legal_name || "",
          photoUrl: filename
            ? `${pb.baseURL}/api/files/expert_profiles/${record.id}/${encodeURIComponent(filename)}`
            : null,
          roles: toStringList(record.specialization_type, `expert ${record.id}: specialization_type`),
          specialistCategoryIds: Array.from(new Set(recordStringArray(record.specialist_roles, `expert ${record.id}: specialist_roles`).map(id => roleGroups.get(id)).filter((id): id is string => typeof id === "string" && !!id))),
          degree: record.highest_academic_degree || null,
          fieldOfStudy: record.degree_title || null,
          bio: "",
          publicNameEn: record.public_name_en || "",
          publicNameAr: record.public_name_ar || "",
          publicQualificationEn: record.public_qualification_en || "",
          publicQualificationAr: record.public_qualification_ar || "",
          publicSpecialtyEn: record.public_specialty_en || "",
          publicSpecialtyAr: record.public_specialty_ar || "",
          shortBioEn: record.short_bio_en || "",
          shortBioAr: record.short_bio_ar || "",
        }
      })
  } catch (error) {
    throw new Error(`Public expert catalog requires correction: ${error instanceof Error ? error.message : String(error)}`)
  }
}
