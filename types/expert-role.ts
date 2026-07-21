import type { ToolTypeRecord } from "@/lib/tool-types"

export interface RolesManagement {
  id: string
  name: string
  tool_types: string[]
  expand?: {
    tool_types?: ToolTypeRecord[]
  }
}
