"use client"

import { useLang } from "@/lib/lang-context"
import type { MeetingConfig } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Calendar } from "lucide-react"

interface MeetingPreviewProps {
  config: MeetingConfig
}

export function MeetingPreview({ config }: MeetingPreviewProps) {
  const { lang } = useLang()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {lang === "ar" ? "تفاصيل الاجتماع" : "Meeting Details"}
          </CardTitle>
          <Badge
            variant={config.type === "one_to_one" ? "default" : "secondary"}
          >
            {config.type === "one_to_one"
              ? lang === "ar"
                ? "فردي"
                : "One-to-One"
              : lang === "ar"
                ? "وجها لوجه"
                : "Face-to-Face"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {config.duration} {lang === "ar" ? "دقيقة" : "minutes"}
          </span>
        </div>

        {config.allowScheduling && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{lang === "ar" ? "متاح للحجز" : "Scheduling available"}</span>
          </div>
        )}

        {config.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{config.location[lang]}</span>
          </div>
        )}

        {config.instructions[lang] && (
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="mb-1 text-sm font-medium">
              {lang === "ar" ? "التعليمات" : "Instructions"}
            </p>
            <p className="text-sm text-muted-foreground">
              {config.instructions[lang]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
