"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useLang } from "@/lib/lang-context"
import { trainingProgramsCollection } from "@/lib/pb-training"
import { ProgramCard } from "@/components/training"
import type { TrainingProgram } from "@/types/training"
import { Search, GraduationCap } from "lucide-react"

export default function TrainingProgrammesPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await trainingProgramsCollection.getPublished()
        setPrograms(data)
      } catch (err) {
        console.error("Failed to load training programmes:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = searchTerm
    ? programs.filter(
        (p) =>
          p.title[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.trainer.name[lang].toLowerCase().includes(searchTerm.toLowerCase())
      )
    : programs

  const handleView = (id: string) => {
    router.push(`/programmes/training_programmes/${id}`)
  }

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
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "ar" ? "البرامج التدريبية" : "Training Programmes"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "تصفح البرامج التدريبية المتاحة"
            : "Browse available training programmes"}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={
            lang === "ar"
              ? "البحث في البرامج التدريبية..."
              : "Search programmes by title or trainer..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">
            {lang === "ar" ? "لا توجد برامج تدريبية" : "No training programmes found"}
          </h3>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "لم يتم العثور على برامج تدريبية متاحة"
              : "No available training programmes found"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onView={() => handleView(program.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
