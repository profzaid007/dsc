"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useLang } from "@/lib/lang-context"
import { trainingSessionsCollection } from "@/lib/pb-training"
import { SessionCard } from "@/components/training"
import type { AwarenessSession } from "@/types/training"
import { Search, Presentation } from "lucide-react"

export default function AwarenessSessionsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [sessions, setSessions] = useState<AwarenessSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await trainingSessionsCollection.getPublished()
        setSessions(data)
      } catch (err) {
        console.error("Failed to load awareness sessions:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = searchTerm
    ? sessions.filter(
        (s) =>
          s.title[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.speaker.name[lang].toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sessions

  const handleView = (id: string) => {
    router.push(`/programmes/awareness_sessions/${id}`)
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
          {lang === "ar" ? "جلسات التوعية" : "Awareness Sessions"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "تصفح جلسات التوعية المتاحة"
            : "Browse available awareness sessions"}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={
            lang === "ar"
              ? "البحث في جلسات التوعية..."
              : "Search sessions by title or speaker..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Presentation className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">
            {lang === "ar" ? "لا توجد جلسات توعية" : "No awareness sessions found"}
          </h3>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "لم يتم العثور على جلسات توعية متاحة"
              : "No available awareness sessions found"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onView={() => handleView(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
