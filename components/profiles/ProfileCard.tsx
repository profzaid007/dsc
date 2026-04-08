"use client"

import Link from "next/link"
import type { Profile } from "@/types/profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const statusColors: Record<Profile["status"], string> = {
  created: "bg-blue-100 text-blue-800",
  assessment_started: "bg-yellow-100 text-yellow-800",
  assessment_completed: "bg-green-100 text-green-800",
  active: "bg-purple-100 text-purple-800",
  archived: "bg-gray-100 text-gray-800",
}

const statusLabels: Record<Profile["status"], { en: string; ar: string }> = {
  created: { en: "Created", ar: "تم الإنشاء" },
  assessment_started: { en: "Assessment Started", ar: "بدأ التقييم" },
  assessment_completed: { en: "Assessment Completed", ar: "اكتمل التقييم" },
  active: { en: "Active", ar: "نشط" },
  archived: { en: "Archived", ar: "مؤرشف" },
}

interface ProfileCardProps {
  profile: Profile
  lang?: "en" | "ar"
}

export function ProfileCard({ profile, lang = "en" }: ProfileCardProps) {
  return (
    <Link href={`/dashboard/profiles/${profile.id}`}>
      <Card className="h-full cursor-pointer transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{profile.childName}</CardTitle>
            <Badge className={statusColors[profile.status]}>
              {statusLabels[profile.status][lang]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Age:</span> {profile.age}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Grade:</span> {profile.grade}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Parent:</span> {profile.parentName}
          </div>
          {profile.mainConcern.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {profile.mainConcern.slice(0, 2).map((concern) => (
                <Badge key={concern} variant="outline" className="text-xs">
                  {concern}
                </Badge>
              ))}
              {profile.mainConcern.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.mainConcern.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
