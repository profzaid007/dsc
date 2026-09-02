"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quotations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
