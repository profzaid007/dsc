"use client"

import Link from "next/link"
import type { Profile } from "@/types/profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface ProfileCardProps {
  profile: Profile
  lang?: "en" | "ar"
}

export function ProfileCard({ profile, lang = "en" }: ProfileCardProps) {
  return (
    <Link href={`/dashboard/profiles/${profile.id}`}>
      <Card className="h-full cursor-pointer transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{profile.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{profile.date_of_birth}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground capitalize">
            {profile.gender} | {profile.grade}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
