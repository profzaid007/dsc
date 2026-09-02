"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProjectDetailPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Project Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Project details coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
