"use client"

import type { Profile } from "@/types/profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartLink } from "@/components/smart-link"
import { Calendar } from "lucide-react"
import { formatDate } from "@/lib/format-date"
import { CaseStatusBadge } from "@/components/cases/status-badge"

interface ProfileCardProps {
  profile: Profile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <SmartLink href={`/dashboard/cases/${profile.id}`}>
      <Card className="h-full cursor-pointer transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{profile.name}</CardTitle>
            <CaseStatusBadge status={profile.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{profile.date_of_birth ? formatDate(profile.date_of_birth) : "—"}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground capitalize">
            {profile.gender} | {profile.grade}
          </div>
        </CardContent>
      </Card>
    </SmartLink>
  )
}
