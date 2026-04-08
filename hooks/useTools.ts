import { useAppStore } from "@/lib/store"
import type { Tool, ToolType, ServiceType } from "@/types/tool"

export function useTools() {
  const tools = useAppStore((state) => state.tools)

  const addTool = useAppStore((state) => state.addTool)
  const updateTool = useAppStore((state) => state.updateTool)
  const deleteTool = useAppStore((state) => state.deleteTool)
  const getToolById = useAppStore((state) => state.getToolById)
  const getToolsByType = useAppStore((state) => state.getToolsByType)
  const getToolsByServiceType = useAppStore(
    (state) => state.getToolsByServiceType
  )

  const activeTools = tools.filter((t) => t.status === "active")

  return {
    tools,
    activeTools,
    addTool,
    updateTool,
    deleteTool,
    getToolById,
    getToolsByType,
    getToolsByServiceType,
  }
}
