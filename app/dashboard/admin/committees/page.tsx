"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function CommitteesOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Committee Management</h1>
        <p className="text-muted-foreground">
          Organize committees, manage members, schedule meetings, and track tasks effectively
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Committee Management Description: Organize committees, manage members, schedule meetings, and track tasks effectively.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
