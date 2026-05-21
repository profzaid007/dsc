"use client"

import { useRouter } from "next/navigation"
import { LectureForm } from "@/components/lectures"
import { useLectures } from "@/hooks/useLectures"
import { useLang } from "@/lib/lang-context"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewLecturePage() {
  const router = useRouter()
  const { lang } = useLang()
  const { addLecture } = useLectures()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Parameters<typeof addLecture>[0]) => {
    setIsSubmitting(true)
    try {
      await addLecture(data)
      router.push("/dashboard/admin/public-lectures")
    } catch (error) {
      console.error("Failed to create lecture:", error)
      alert(lang === "ar" ? "فشل إنشاء المحاضرة" : "Failed to create lecture")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "ar" ? "محاضرة جديدة" : "New Lecture"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "إنشاء محاضرة عامة جديدة"
              : "Create a new public lecture"}
          </p>
        </div>
      </div>

      <LectureForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/admin/public-lectures")}
        isSubmitting={isSubmitting}
        submitLabel={lang === "ar" ? "إنشاء المحاضرة" : "Create Lecture"}
      />
    </div>
  )
}
