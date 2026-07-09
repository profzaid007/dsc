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
          trainingProgramsCollection.getPublished(),
        ])

        const now = new Date()
        const nowISO = now.toISOString()
        const upcomingLectures = lecturesData.filter(
          (l) => l.schedule.dateTime >= nowISO
        )
        const upcomingPrograms = programsData.filter(
          (p) => new Date(p.schedule.startDate) >= now
        )
        setLectures(upcomingLectures)
        setPrograms(upcomingPrograms)
      } catch (err) {
        console.error("Failed to load programmes:", err)
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
          {lang === "ar" ? "البرامج" : "Programmes"}
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
            {lang === "ar" ? "عرض الكل" : "View Past Lectures"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {lectures.length === 0 ? (
          <div className="py-8 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {lang === "ar" ? "توجد محاضرات قادمة" : "No upcoming lectures available"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.slice(0, 3).map((lecture) => (
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
            {lang === "ar" ? "عرض البرامج السابقة" : "View Past Programmes"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {programs.length === 0 ? (
          <div className="py-8 text-center">
            <GraduationCap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {lang === "ar" ? "لا توجد برامج تدريبية متاحة" : "No upcoming training programmes available"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 3).map((program) => (
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
