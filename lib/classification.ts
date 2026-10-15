import catalog from "./classification-catalog.json"

export const MAIN_CLASSIFICATIONS = catalog.main
export const EXPERT_CLASSIFICATIONS = MAIN_CLASSIFICATIONS.filter(c => !c.media_only)
export function mainCategoryKey(key: string): string {
  return key === "psychology" ? "mental-health" : key
}
export function classificationParent(key: string): string {
  return (catalog.parents as Record<string, string>)[key] || ""
}
export function classificationLabel(key: string, lang: "ar" | "en"): string {
  return MAIN_CLASSIFICATIONS.find(c => c.key === key)?.[lang] || key
}
export function validClassification(main: string, sub: string, categories: { key: string; main_category?: string }[]): boolean {
  return MAIN_CLASSIFICATIONS.some(c => c.key === main) && (!sub || categories.some(c => c.key === sub && (c.main_category || classificationParent(c.key)) === main))
}
