import { EXPERT_CLASSIFICATIONS, mainCategoryKey } from "./classification"
import catalog from "./allocation-role-catalog.json"
import type { RolesManagement } from "@/types/expert-role"

// Uses the same six professional categories as articles, events and the landing page.
export const ALLOCATION_ROLE_GROUPS = EXPERT_CLASSIFICATIONS.map(c => ({ id: c.key, en: c.en, ar: c.ar }))

const legacyGroups: Record<string, string> = {
  physician: "medical",
  "social specialist": "mental-health",
  teacher: "education",
  trainer: "education",
}

/** Classify existing records without replacing their IDs or tool permissions. */
export function normalizeAllocationRole(role: RolesManagement): RolesManagement {
  if (role.role_group === "psychology") role = { ...role, role_group: mainCategoryKey(role.role_group) }
  const knownGroup = ALLOCATION_ROLE_GROUPS.some(group => group.id === role.role_group)
  if (knownGroup) return role
  const name = role.role_name_en?.trim().toLowerCase() || ""
  const match = catalog.find(item =>
    item.role_name_en.toLowerCase() === name ||
    (role.role_name_ar?.trim() && item.role_name_ar === role.role_name_ar.trim())
  )
  return {
    ...role,
    role_group: match?.role_group || legacyGroups[name] || "other",
    role_order: role.role_order || match?.role_order || 0,
  }
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
