"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function TrainingOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Training Management</h1>
        <p className="text-muted-foreground">
          Manage all training programs, awareness sessions, certificates, and participant registrations
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Training Description: Manage all training programs, awareness sessions, certificates, and participant registrations in one place.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
