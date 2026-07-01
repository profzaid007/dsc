"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTraining } from "@/hooks/useTraining"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { TrainingNav, CertificateCard } from "@/components/training"
import { Award } from "lucide-react"

export default function MyCertificatesPage() {
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const { getUserCertificates, isLoading } = useTraining()

  const certificates = currentUser
    ? getUserCertificates(currentUser.id)
    : []

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "ar" ? "شهاداتي" : "My Certificates"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "عرض وإدارة شهاداتك التدريبية"
            : "View and manage your training certificates"}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TrainingNav />
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              {lang === "ar" ? "لا توجد شهادات" : "No certificates yet"}
            </h3>
            <p className="text-muted-foreground">
              {lang === "ar"
                ? "ستظهر شهاداتك هنا بعد إكمال البرامج التدريبية"
                : "Your certificates will appear here after completing training programs"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              onDownload={() => {
                if (certificate.file) {
                  window.open(certificate.file, "_blank")
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
