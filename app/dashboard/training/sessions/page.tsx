"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTraining } from "@/hooks/useTraining"
import { SessionCard, TrainingNav } from "@/components/training"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { Search, Presentation } from "lucide-react"

export default function TrainingSessionsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const {
    getPublishedSessions,
    getUpcomingSessions,
    getPastSessions,
    getUserSessionRegistration,
    isSessionFull,
    isLoading,
  } = useTraining()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const allPublished = getPublishedSessions()
  const upcoming = getUpcomingSessions()
  const past = getPastSessions()

  const getFilteredSessions = (sessions: typeof allPublished) => {
    if (!searchTerm) return sessions
    return sessions.filter(
      (session) =>
        session.title[lang]
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        session.speaker.name[lang]
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        session.category[lang]
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
  }

  const filteredAll = getFilteredSessions(allPublished)
  const filteredUpcoming = getFilteredSessions(upcoming)
  const filteredPast = getFilteredSessions(past)

  const handleViewSession = (id: string) => {
    router.push(`/dashboard/training/sessions/${id}`)
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

  const renderSessionGrid = (sessions: typeof allPublished) => {
    if (sessions.length === 0) {
      return (
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
      )
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => {
          const isRegistered = currentUser
            ? !!getUserSessionRegistration(session.id, currentUser.id)
            : false
          const isFull = isSessionFull(session.id)

          return (
            <SessionCard
              key={session.id}
              session={session}
              onView={() => handleViewSession(session.id)}
              onRegister={() => handleViewSession(session.id)}
              isRegistered={isRegistered}
              isFull={isFull}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "ar" ? "جلسات التوعية" : "Awareness Sessions"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "تصفح جلسات التوعية والتسجيل للمشاركة"
            : "Browse awareness sessions and register to participate"}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TrainingNav />
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              lang === "ar"
                ? "البحث في الجلسات..."
                : "Search sessions by title or speaker..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <Presentation className="me-2 h-4 w-4" />
            {lang === "ar" ? "الكل" : "All"}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            {lang === "ar" ? "القادمة" : "Upcoming"}
          </TabsTrigger>
          <TabsTrigger value="past">
            {lang === "ar" ? "السابقة" : "Past"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "جميع الجلسات" : "All Sessions"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderSessionGrid(filteredAll)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "الجلسات القادمة" : "Upcoming Sessions"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderSessionGrid(filteredUpcoming)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "الجلسات السابقة" : "Past Sessions"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderSessionGrid(filteredPast)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
