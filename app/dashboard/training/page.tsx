"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTraining } from "@/hooks/useTraining"
import { ProgramCard, TrainingNav } from "@/components/training"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { Search, GraduationCap } from "lucide-react"

export default function TrainingProgramsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const {
    getPublishedPrograms,
    getUpcomingPrograms,
    getPastPrograms,
    getUserProgramRegistration,
    isProgramFull,
    isLoading,
  } = useTraining()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const allPublished = getPublishedPrograms()
  const upcoming = getUpcomingPrograms()
  const past = getPastPrograms()

  const getFilteredPrograms = (programs: typeof allPublished) => {
    if (!searchTerm) return programs
    return programs.filter(
      (program) =>
        program.title[lang]
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        program.trainer.name[lang]
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        program.category[lang]
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
  }

  const filteredAll = getFilteredPrograms(allPublished)
  const filteredUpcoming = getFilteredPrograms(upcoming)
  const filteredPast = getFilteredPrograms(past)

  const handleViewProgram = (id: string) => {
    router.push(`/dashboard/training/${id}`)
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

  const renderProgramGrid = (programs: typeof allPublished) => {
    if (programs.length === 0) {
      return (
        <div className="py-12 text-center">
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">
            {lang === "ar" ? "لا توجد برامج تدريبية" : "No training programs found"}
          </h3>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "لم يتم العثور على برامج تدريبية متاحة"
              : "No available training programs found"}
          </p>
        </div>
      )
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => {
          const isRegistered = currentUser
            ? !!getUserProgramRegistration(program.id, currentUser.id)
            : false
          const isFull = isProgramFull(program.id)

          return (
            <ProgramCard
              key={program.id}
              program={program}
              onView={() => handleViewProgram(program.id)}
              onRegister={() => handleViewProgram(program.id)}
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
          {lang === "ar" ? "البرامج التدريبية" : "Training Programs"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "تصفح البرامج التدريبية المتاحة والتسجيل للمشاركة"
            : "Browse available training programs and register to participate"}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TrainingNav />
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              lang === "ar"
                ? "البحث في البرامج..."
                : "Search programs by title or trainer..."
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
            <GraduationCap className="me-2 h-4 w-4" />
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
                {lang === "ar" ? "جميع البرامج" : "All Programs"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderProgramGrid(filteredAll)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "البرامج القادمة" : "Upcoming Programs"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderProgramGrid(filteredUpcoming)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "البرامج السابقة" : "Past Programs"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderProgramGrid(filteredPast)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
