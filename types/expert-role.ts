import type { ToolTypeRecord } from "@/lib/tool-types"

export interface RolesManagement {
  id: string
  role_name_en: string
  role_name_ar: string
  role_group?: string
  role_order?: number
  is_retired?: boolean
  tool_types: string[]
  expand?: {
    tool_types?: ToolTypeRecord[]
  }
}
