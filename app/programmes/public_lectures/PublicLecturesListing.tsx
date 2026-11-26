"use client"

import { matchesContentSearch } from "@/lib/content-search"
import { useState } from "react"
import { localizedPath } from "@/lib/locale-routing"
import { Input } from "@/components/ui/input"
import { useLang } from "@/lib/lang-context"
import { LectureCard } from "@/components/lectures"
import type { Lecture } from "@/types/lecture"
import { Search, BookOpen } from "lucide-react"

export default function PublicLecturesListing({ lectures }: { lectures: Lecture[] }) {
  const { lang } = useLang()
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = searchTerm
    ? lectures.filter(
        (l) =>
          matchesContentSearch(searchTerm, l.title[lang], l.speaker.name[lang], l.keywords)
      )
    : lectures

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
              ? "ابحث بالعنوان أو المحاضر أو الكلمات المفتاحية..."
              : "Search lectures by title, speaker or keywords..."
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
              viewHref={localizedPath(`/programmes/public_lectures/${lecture.id}`, lang)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
