"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useLang } from "@/lib/lang-context"
import { publicLecturesPublicCollection } from "@/lib/pb-lectures"
import { LectureCard } from "@/components/lectures"
import type { Lecture } from "@/types/lecture"
import { Search, BookOpen } from "lucide-react"

export default function PublicLecturesPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicLecturesPublicCollection.getAll()
        setLectures(data)
      } catch (err) {
        console.error("Failed to load public lectures:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = searchTerm
    ? lectures.filter(
        (l) =>
          l.title[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.speaker.name[lang].toLowerCase().includes(searchTerm.toLowerCase())
      )
    : lectures

  const handleView = (id: string) => {
    router.push(`/programmes/public_lectures/${id}`)
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
          {lang === "ar" ? "المحاضرات العامة" : "Public Lectures"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "تصفح المحاضرات المتاحة"
            : "Browse available lectures"}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={
            lang === "ar"
              ? "البحث في المحاضرات..."
              : "Search lectures by title or speaker..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">
            {lang === "ar" ? "لا توجد محاضرات" : "No lectures found"}
          </h3>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "لم يتم العثور على محاضرات متاحة"
              : "No available lectures found"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lecture) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              onView={() => handleView(lecture.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
