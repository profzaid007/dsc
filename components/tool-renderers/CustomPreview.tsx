"use client"

import { useLang } from "@/lib/lang-context"
import type { CustomConfig } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CustomPreviewProps {
  config: CustomConfig
}

export function CustomPreview({ config }: CustomPreviewProps) {
  const { lang } = useLang()

  if (!config.content[lang]) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No content added yet
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lang === "ar" ? "محتوى مخصص" : "Custom Content"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
          {config.content[lang]}
        </div>
      </CardContent>
    </Card>
  )
}
