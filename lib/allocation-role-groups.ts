import { EXPERT_CLASSIFICATIONS } from "./classification"
import type { RolesManagement } from "@/types/expert-role"

// Uses the same professional categories as articles, events and the landing page.
export const ALLOCATION_ROLE_GROUPS = EXPERT_CLASSIFICATIONS.map(c => ({ id: c.key, en: c.en, ar: c.ar }))

/** Missing categories are data errors, not inferred from a role's name. */
export function normalizeAllocationRole(role: RolesManagement): RolesManagement {
  if (!role.role_group?.trim() || ["psychology", "dsc-news"].includes(role.role_group))
    throw new Error(`Role ${role.id} (${role.role_name_en}) needs a corrected professional category.`)
  return role
}

export function allocationRowsForSave(
  rows: { id?: string; expert_id: string; role: string }[],
  roles: RolesManagement[]
) {
  return rows.map(row => {
    const role = roles.find(item => item.role_name_en === row.role)
    if (!role) throw new Error("The selected role is no longer available. Refresh and select a role again.")
    return { ...row, role_id: role.id }
  })
}
