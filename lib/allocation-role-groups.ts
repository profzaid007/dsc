import { EXPERT_CLASSIFICATIONS } from "./classification"
import type { RolesManagement } from "@/types/expert-role"

// Uses the same professional categories as articles, events and the landing page.
export const ALLOCATION_ROLE_GROUPS = EXPERT_CLASSIFICATIONS.map(c => ({ id: c.key, en: c.en, ar: c.ar }))

/** Base records use category relations. Public catalog keys are a read-only SQL projection. */
export function normalizeAllocationRole(role: RolesManagement): RolesManagement {
  const category = role.expand?.category
  if (role.category) {
    if (!category || category.id !== role.category || !category.key?.trim() || category.media_only || ["psychology", "dsc-news"].includes(category.key))
      throw new Error(`Role ${role.id} (${role.role_name_en}) needs a corrected professional category.`)
    return { ...role, role_group: category.key, role_order: role.order ?? 0, is_retired: role.is_active === false || category.is_active === false }
  }
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
    return { ...(row.id ? { id: row.id } : {}), expert_id: row.expert_id, role_id: role.id }
  })
}
