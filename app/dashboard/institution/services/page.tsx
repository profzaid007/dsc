"use client"
import { useUiTranslation } from "@/hooks/useUiTranslation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ServicesPage() {
  const ui = useUiTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ui("Services")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{ui("Available Services")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{ui("Coming soon.")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
