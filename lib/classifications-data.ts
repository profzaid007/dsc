import pb from "@/lib/pb"
import { boundedFullList } from "@/lib/bounded-records"
import { mainCategoryKey } from "@/lib/classification"

export interface ClassificationDefinition {
  id: string
  key: string
  en: string
  ar: string
  media_only: boolean
  is_active: boolean
}

export async function getClassificationDefinitions(): Promise<
  ClassificationDefinition[]
> {
  const records = await boundedFullList(
    pb.collection("specialist_role_categories"),
    { sort: "order,name_en", requestKey: null }
  )
  return records.map((record) => ({
    id: record.id,
    key: mainCategoryKey(String(record.key || "")),
    en: String(record.name_en || ""),
    ar: String(record.name_ar || ""),
    media_only: record.media_only === true || record.key === "dsc-news",
    is_active: record.is_active !== false,
  }))
}
