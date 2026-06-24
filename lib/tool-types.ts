import {
  FileText,
  ClipboardList,
  FileBarChart,
  Layers,
  Paperclip,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { BilingualString, ToolType } from "@/types/tool"

export interface ToolTypeRecord {
  id: string
  key: string
  name: string
  label: BilingualString
}

export const toolTypeRegistry: Record<
  ToolType,
  { icon: LucideIcon; route: string }
> = {
  survey: { icon: FileText, route: "survey" },
  multiple_answer: { icon: ClipboardList, route: "multiple-choice" },
  report: { icon: FileBarChart, route: "report" },
  plan: { icon: Layers, route: "plan" },
  attachment_request: { icon: Paperclip, route: "attachment-request" },
}

export const toolTypeOrder: ToolType[] = [
  "survey",
  "multiple_answer",
  "report",
  "plan",
  "attachment_request",
]

export function getToolTypeRecordById(
  toolTypes: ToolTypeRecord[],
  id: string | undefined
): ToolTypeRecord | undefined {
  if (!id) return undefined
  return toolTypes.find((toolType) => toolType.id === id)
}

export function getToolTypeRecordByKey(
  toolTypes: ToolTypeRecord[],
  key: string | undefined
): ToolTypeRecord | undefined {
  if (!key) return undefined
  return toolTypes.find((toolType) => toolType.key === key)
}

export function getToolTypeLabel(
  toolType: ToolTypeRecord | undefined,
  lang: keyof BilingualString = "en"
): string {
  if (!toolType) return "Unknown"
  return toolType.label[lang] || toolType.label.en || toolType.key
}

export function getToolTypeMeta(key: string | undefined) {
  if (!key) return undefined
  return toolTypeRegistry[key as ToolType]
}
