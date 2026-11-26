import { getPublicEventClock } from "@/lib/public-events"
import { PublicEventTime } from "@/components/PublicEventTime"
import { notFound } from "next/navigation"
import { getPublicLecture } from "@/lib/public-events"
import { PublicEventsUnavailable } from "@/components/PublicEventsUnavailable"
import PublicLectureDetail from "./PublicLectureDetail"
export default async function PublicLectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let data
  try {
    data = await getPublicLecture(id)
  } catch {
    return <PublicEventsUnavailable />
  }
  if (!data) notFound()
  return (
    <PublicEventTime initialNow={getPublicEventClock()}>
      <PublicLectureDetail key={data.id} lecture={data} />
    </PublicEventTime>
  )
}
