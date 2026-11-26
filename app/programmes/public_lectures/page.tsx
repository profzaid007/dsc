import { getPublicEventClock } from "@/lib/public-events"
import { PublicEventTime } from "@/components/PublicEventTime"
import { getPublicLectures } from "@/lib/public-events"
import { PublicEventsUnavailable } from "@/components/PublicEventsUnavailable"
import PublicLecturesListing from "./PublicLecturesListing"
export default async function PublicLecturesPage() {
  let data
  try {
    data = await getPublicLectures()
  } catch {
    return <PublicEventsUnavailable />
  }
  return (
    <PublicEventTime initialNow={getPublicEventClock()}>
      <PublicLecturesListing lectures={data} />
    </PublicEventTime>
  )
}
