import type { ToolTypeRecord } from "@/lib/tool-types"

export interface RolesManagement {
  id: string
  role_name_en: string
  role_name_ar: string
  category?: string
  order?: number
  is_active?: boolean
  /** Derived display key; never written to roles_management. */
  role_group?: string
  role_order?: number
  is_retired?: boolean
  tool_types: string[]
  expand?: {
    tool_types?: ToolTypeRecord[]
    category?: { id: string; key: string; media_only?: boolean; is_active?: boolean }
  }
}
