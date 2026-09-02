"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExpertProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Profile editing coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
