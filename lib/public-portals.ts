import "server-only"
import { canonicalPortalId } from "@/lib/portal-routing"
import { cache } from "react"
import PocketBase from "pocketbase"
import { boundedFullList } from "@/lib/bounded-records"
import { portalFromRecord } from "@/lib/portal-data"

function anonymousClient() {
  return new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090")
}
export const getPublicPortals = cache(async () => {
  try {
    const rows = await boundedFullList(anonymousClient().collection("portals"), {
      filter: 'is_deleted=false && portal_key != "3"', sort: "order,created", requestKey: null,
      signal: AbortSignal.timeout(8000),
    })
    return { portals: rows.map(portalFromRecord), error: null }
  } catch {
    return { portals: [], error: "Unable to load portals." }
  }
})

export type HomepageService = { id: string; slug: string; portalId: string; name: { en: string; ar: string } }
export async function getHomepageServices(): Promise<HomepageService[]> {
  try {
    const { items } = await anonymousClient().collection("info_pages").getList(1, 4, {
      filter: "is_published=true", sort: "order,id", requestKey: null,
      fields: "id,slug,portal_name,title_en,title_ar", signal: AbortSignal.timeout(8000),
    })
    return items.map(row => ({ id: row.id, slug: row.slug, portalId: canonicalPortalId(row.portal_name || ""), name: { en: row.title_en, ar: row.title_ar || row.title_en } }))
  } catch { return [] }
}
