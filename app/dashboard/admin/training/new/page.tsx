"use client"

import { useRouter } from "next/navigation"
import { ProgramForm } from "@/components/training"
import { useTraining } from "@/hooks/useTraining"
import { useLang } from "@/lib/lang-context"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewTrainingProgramPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { addProgram } = useTraining()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Parameters<typeof addProgram>[0]) => {
    setIsSubmitting(true)
    try {
      const newId = await addProgram(data)
      router.push(`/dashboard/admin/training/${newId}`)
    } catch (error) {
      console.error("Failed to create program:", error)
      alert(lang === "ar" ? "فشل إنشاء البرنامج" : "Failed to create program")
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
            {lang === "ar" ? "برنامج جديد" : "New Training Program"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "إنشاء برنامج تدريبي جديد"
              : "Create a new training program"}
          </p>
        </div>
      </div>

      <ProgramForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/admin/training")}
        isSubmitting={isSubmitting}
        submitLabel={lang === "ar" ? "إنشاء البرنامج" : "Create Program"}
      />
    </div>
  )
}
