"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import pb from "@/lib/pb"
import type { LookupEntry } from "@/types/lookup"
import { User, Users, Building2, GraduationCap } from "lucide-react"

const USER_TYPE_ICONS: Record<string, React.ReactNode> = {
  parent: <Users className="h-8 w-8" />,
  individual: <User className="h-8 w-8" />,
  organization: <Building2 className="h-8 w-8" />,
  expert: <GraduationCap className="h-8 w-8" />,
}

const USER_TYPE_ROUTES: Record<string, string> = {
  parent: "/register/parent",
  individual: "/register/individual",
  organization: "/register/organization",
  expert: "/register/expert",
}

export function UserTypeSelector() {
  const { lang } = useLang()
  const [userTypes, setUserTypes] = useState<LookupEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserTypes() {
      try {
        const data = await pb
          .collection("lookups")
          .getFullList({ filter: 'type = "user_types"' })
        setUserTypes(data as unknown as LookupEntry[])
      } catch (error) {
        console.error("Failed to fetch user types:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserTypes()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {userTypes.map((userType) => {
        const route = USER_TYPE_ROUTES[userType.key] || "#"
        const icon = USER_TYPE_ICONS[userType.key] || <User className="h-8 w-8" />

        return (
          <Link key={userType.id} href={route} className="block">
            <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50 hover:bg-primary/5">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="text-primary">{icon}</div>
                <h3 className="text-lg font-semibold">
                  {t(
                    { en: userType.label_en, ar: userType.label_ar },
                    lang
                  )}
                </h3>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
