import { PublicEventTime } from "@/components/PublicEventTime"
import {
  getPublicLectures,
  getPublicPrograms,
  getPublicEventClock,
  getPublicEventClassifications,
} from "@/lib/public-events"
import ProgrammesListing from "./ProgrammesListing"
export default async function ProgrammesPage() {
  const [lectures, programs, definitions] = await Promise.allSettled([
    getPublicLectures(),
    getPublicPrograms(),
    getPublicEventClassifications(),
  ])
  return (
    <PublicEventTime initialNow={getPublicEventClock()}>
      <ProgrammesListing
        initialLectures={lectures.status === "fulfilled" ? lectures.value : []}
        initialPrograms={programs.status === "fulfilled" ? programs.value : []}
        initialError={
          lectures.status === "rejected" || programs.status === "rejected"
        }
        initialDefinitions={
          definitions.status === "fulfilled" ? definitions.value : []
        }
        initialNow={getPublicEventClock()}
      />
    </PublicEventTime>
  )
}
