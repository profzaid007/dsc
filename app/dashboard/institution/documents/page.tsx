"use client"
import { useUiTranslation } from "@/hooks/useUiTranslation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocumentsPage() {
  const ui = useUiTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ui("Documents")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{ui("Documents")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{ui("Coming soon.")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
