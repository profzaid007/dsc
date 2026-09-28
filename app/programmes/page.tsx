"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLang } from "@/lib/lang-context"
import { publicLecturesPublicCollection } from "@/lib/pb-lectures"
import { trainingProgramsCollection } from "@/lib/pb-training"
import { LectureCard } from "@/components/lectures"
import { ProgramCard } from "@/components/training"
import type { Lecture } from "@/types/lecture"
import type { TrainingProgram } from "@/types/training"
import { BookOpen, GraduationCap, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/pb"

/**
 * Orders sessions so the ones a visitor can still act on come first, soonest
 * at the very top, with the most recent past ones at the bottom.
 *
 * Negative = a is sooner (or more recently past) than b, so the leading sign
 * keeps the array ascending.
 */
function sortByUpcoming(a: string, b: string, now: number): number {
  const aUpcoming = new Date(a).getTime() >= now
  const bUpcoming = new Date(b).getTime() >= now

  // Upcoming always sorts ahead of past.
  if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1

  // Within upcoming, soonest first. Within past, most recent first.
  const delta = new Date(a).getTime() - new Date(b).getTime()
  return aUpcoming ? delta : -delta
}

export default function ProgrammesPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [lecturesData, programsData] = await Promise.all([
          publicLecturesPublicCollection.getAll(),
          trainingProgramsCollection.getPubliclyVisible(),
        ])

        // The public_lectures_public PocketBase view decides which records it
        // exposes, so we can't rely on it to drop unpublished ones. Filter here
        // to be certain nothing draft or cancelled reaches the public page.
        const now = Date.now()

        const visibleLectures = lecturesData
          .filter((l) => l.status !== "draft" && l.status !== "cancelled")
          .sort(
            (a, b) => sortByUpcoming(a.schedule.dateTime, b.schedule.dateTime, now)
          )

        const visiblePrograms = programsData.sort(
          (a, b) =>
            sortByUpcoming(a.schedule.startDate, b.schedule.startDate, now)
        )

        setLectures(visibleLectures)
        setPrograms(visiblePrograms)
      } catch (err) {
        console.error("Failed to load programmes:", err)
        toast.error(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#0b2545]">
          {lang === "ar" ? "الدورات والبرامج" : "Programmes"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {lang === "ar"
            ? "استعرض جميع برامجنا وفعالياتنا"
            : "Browse all our programmes and events"}
        </p>
      </div>

      {/* Public Lectures */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-[#008f53]" />
            <h2 className="text-2xl font-bold text-[#0b2545]">
              {lang === "ar" ? "المحاضرات العامة" : "Public Lectures"}
            </h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/programmes/public_lectures")}
            className="gap-1"
          >
            {lang === "ar" ? "عرض الكل" : "View All Lectures"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {lectures.length === 0 ? (
          <div className="py-18 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {lang === "ar" ? "لا توجد محاضرات" : "No lectures available yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                onView={() => router.push(`/programmes/public_lectures/${lecture.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Training Programmes */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-[#631a7b]" />
            <h2 className="text-2xl font-bold text-[#0b2545]">
              {lang === "ar" ? "البرامج التدريبية" : "Training Programmes"}
            </h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/programmes/training_programmes")}
            className="gap-1"
          >
            {lang === "ar" ? "عرض البرامج السابقة" : "View All Programmes"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {programs.length === 0 ? (
          <div className="py-8 text-center">
            <GraduationCap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {lang === "ar" ? "لا توجد برامج تدريبية" : "No training programmes available yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onView={() => router.push(`/programmes/training_programmes/${program.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
