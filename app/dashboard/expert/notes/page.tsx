"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
