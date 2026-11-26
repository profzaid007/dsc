import { getPublicEventClock } from "@/lib/public-events"
import { PublicEventTime } from "@/components/PublicEventTime"
import { notFound } from "next/navigation"
import { getPublicProgram } from "@/lib/public-events"
import { PublicEventsUnavailable } from "@/components/PublicEventsUnavailable"
import TrainingProgrammeDetail from "./TrainingProgrammeDetail"
export default async function TrainingProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let data
  try {
    data = await getPublicProgram(id)
  } catch {
    return <PublicEventsUnavailable />
  }
  if (!data) notFound()
  return (
    <PublicEventTime initialNow={getPublicEventClock()}>
      <TrainingProgrammeDetail key={data.id} program={data} />
    </PublicEventTime>
  )
}
