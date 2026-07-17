import type { Tool } from "./tool"

export interface RolesManagement {
  id: string
  name: string
  tools: string[]
  expand?: {
    tools?: Tool[]
  }
}
