import { getPublicEventClock } from "@/lib/public-events"
import { PublicEventTime } from "@/components/PublicEventTime"
import { getPublicPrograms } from "@/lib/public-events"
import { PublicEventsUnavailable } from "@/components/PublicEventsUnavailable"
import TrainingProgrammesListing from "./TrainingProgrammesListing"
export default async function TrainingProgrammesPage() {
  let data
  try {
    data = await getPublicPrograms()
  } catch {
    return <PublicEventsUnavailable />
  }
  return (
    <PublicEventTime initialNow={getPublicEventClock()}>
      <TrainingProgrammesListing
        programs={data.filter(
          (program) =>
            program.status === "published" || program.status === "in_progress"
        )}
      />
    </PublicEventTime>
  )
}
