"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
