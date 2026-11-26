import "server-only"
import { cache } from "react"
import PocketBase from "pocketbase"
import { boundedFullList } from "@/lib/bounded-records"
import { lectureFromDB } from "@/lib/pb-lectures"
import type { ClassificationDefinition } from "@/lib/classifications-data"
import { mainCategoryKey } from "@/lib/classification"
import { programFromDB } from "@/lib/pb-training"

// Public HTML must not depend on a signed-in browser's credentials or grants.
const client = () =>
  new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
  )
const options = () => ({ requestKey: null, signal: AbortSignal.timeout(10000) })
const visible = (status: string) =>
  ["published", "in_progress", "completed"].includes(status)

export const getPublicLectures = cache(async () => {
  const records = await boundedFullList(
    client().collection("public_lectures_public"),
    { ...options(), sort: "-created" }
  )
  return records.map(lectureFromDB).filter((lecture) => visible(lecture.status))
})
export const getPublicPrograms = cache(async () => {
  const records = await boundedFullList(client().collection("programs"), {
    ...options(),
    filter:
      'status = "published" || status = "in_progress" || status = "completed"',
    sort: "schedule.startDate",
  })
  return records.map(programFromDB)
})
export const getPublicLecture = cache(async (id: string) => {
  try {
    const record = await client()
      .collection("public_lectures_public")
      .getOne(id, options())
    const lecture = lectureFromDB(record)
    return visible(lecture.status) ? lecture : null
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null
    throw error
  }
})
export const getPublicProgram = cache(async (id: string) => {
  try {
    const record = await client().collection("programs").getOne(id, options())
    const program = programFromDB(record)
    return visible(program.status) ? program : null
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null
    throw error
  }
})

/** One clock value for the initial server render and subsequent hydration. */
export const getPublicEventClock = cache(() => Date.now())

export const getPublicEventClassifications = cache(
  async (): Promise<ClassificationDefinition[]> => {
    const records = await boundedFullList(
      client().collection("specialist_role_categories"),
      { ...options(), sort: "order,name_en" }
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
)
