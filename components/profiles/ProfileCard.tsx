"use client"

import type { Profile } from "@/types/profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartLink } from "@/components/smart-link"
import { Calendar } from "lucide-react"
import { formatDate } from "@/lib/i18n"

interface ProfileCardProps {
  profile: Profile
  lang?: "en" | "ar"
}

export function ProfileCard({ profile, lang = "en" }: ProfileCardProps) {
  return (
    <SmartLink href={`/dashboard/cases/${profile.id}`}>
      <Card className="h-full cursor-pointer transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{profile.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(profile.date_of_birth, lang)}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground capitalize">
            {profile.gender} | {profile.grade}
          </div>
        </CardContent>
      </Card>
    </SmartLink>
  )
}
