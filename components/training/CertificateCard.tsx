"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Calendar, Download, ExternalLink } from "lucide-react"
import type { TrainingCertificate } from "@/types/training"
import { useLang } from "@/lib/lang-context"
import { formatDate } from "@/lib/format-date"

interface CertificateCardProps {
  certificate: TrainingCertificate
  onDownload?: () => void
}

export function CertificateCard({
  certificate,
  onDownload,
}: CertificateCardProps) {
  const { lang } = useLang()

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold leading-none">
              {certificate.programName[lang]}
            </h3>
            <p className="text-sm text-muted-foreground">
              {certificate.userName}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(certificate.issueDate)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline" className="font-mono text-xs">
            {certificate.certificateNumber}
          </Badge>
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              {certificate.file ? (
                <>
                  <Download className="me-1 h-3.5 w-3.5" />
                  {lang === "ar" ? "تحميل" : "Download"}
                </>
              ) : (
                <>
                  <ExternalLink className="me-1 h-3.5 w-3.5" />
                  {lang === "ar" ? "عرض" : "View"}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
