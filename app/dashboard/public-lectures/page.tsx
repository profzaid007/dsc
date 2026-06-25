"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLectures } from "@/hooks/useLectures"
import { LectureCard } from "@/components/lectures"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { Search, Calendar, BookOpen } from "lucide-react"

export default function UserLecturesPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const {
    getPublishedLectures,
    getUpcomingLectures,
    getPastLectures,
    getUserRegistration,
    isLectureFull,
    isLoading,
  } = useLectures()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const allPublished = getPublishedLectures()
  const upcoming = getUpcomingLectures()
  const past = getPastLectures()

  const getFilteredLectures = (lectures: typeof allPublished) => {
    if (!searchTerm) return lectures
    return lectures.filter(
      (lecture) =>
        lecture.title[lang]
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        lecture.speaker.name[lang]
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
  }

  const filteredAll = getFilteredLectures(allPublished)
  const filteredUpcoming = getFilteredLectures(upcoming)
  const filteredPast = getFilteredLectures(past)

  const handleViewLecture = (id: string) => {
    router.push(`/dashboard/public-lectures/${id}`)
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

  const renderLectureGrid = (lectures: typeof allPublished) => {
    if (lectures.length === 0) {
      return (
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
      )
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lectures.map((lecture) => {
          const isRegistered = currentUser
            ? !!getUserRegistration(lecture.id, currentUser.id)
            : false
          const isFull = isLectureFull(lecture.id)

          return (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              onView={() => handleViewLecture(lecture.id)}
              onRegister={() => handleViewLecture(lecture.id)}
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
          {lang === "ar" ? "المحاضرات العامة" : "Public Lectures"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "تصفح المحاضرات المتاحة وسجل للمشاركة"
            : "Browse available lectures and register to participate"}
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <BookOpen className="me-2 h-4 w-4" />
            {lang === "ar" ? "الكل" : "All"}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <Calendar className="me-2 h-4 w-4" />
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
                {lang === "ar" ? "جميع المحاضرات" : "All Lectures"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderLectureGrid(filteredAll)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "المحاضرات القادمة" : "Upcoming Lectures"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderLectureGrid(filteredUpcoming)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "المحاضرات السابقة" : "Past Lectures"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderLectureGrid(filteredPast)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
