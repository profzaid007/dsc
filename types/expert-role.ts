import type { ToolTypeRecord } from "@/lib/tool-types"

export interface RolesManagement {
  id: string
  role_name_en: string
  role_name_ar: string
  tool_types: string[]
  expand?: {
    tool_types?: ToolTypeRecord[]
  }
}
