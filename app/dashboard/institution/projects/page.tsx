"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No projects found.</p>
        </CardContent>
      </Card>
    </div>
  )
}
