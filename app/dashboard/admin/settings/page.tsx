"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { ArrowLeft, List, Landmark, Plus } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const settingsCards = [
  {
    title: { en: "Specialist categories and roles", ar: "فئات وأدوار التخصص" },
    description: {
      en: "Manage bilingual specialist categories and roles",
      ar: "إدارة فئات وأدوار التخصص بالعربية والإنجليزية",
    },
    href: "/dashboard/admin/settings/specialists",
    icon: List,
  },
  {
    title: { en: "Lookups", ar: "القوائم المرجعية" },
    description: {
      en: "Manage tool types and user types",
      ar: "إدارة أنواع الأدوات وأنواع المستخدمين",
    },
    href: "/dashboard/admin/settings/lookups",
    icon: List,
  },
  {
    title: { en: "Payment Settings", ar: "إعدادات الدفع" },
    description: {
      en: "Bank details shown to users when paying for a case",
      ar: "بيانات التحويل البنكي المعروضة للمستخدمين عند الدفع",
    },
    href: "/dashboard/admin/settings/payments",
    icon: Landmark,
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const access = usePermissions()
  const { isAdmin, isSuperAdmin, isLoading } = useAuth()
  const { lang } = useLang()

  useEffect(() => {
    if (!isLoading && !isAdmin && !isSuperAdmin) {
      router.push("/dashboard")
    }
  }, [isLoading, isAdmin, isSuperAdmin, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    )
  }

  if (!isAdmin && !isSuperAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "ar" ? "الإعدادات" : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "إدارة إعدادات التطبيق"
              : "Manage application settings"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {settingsCards
          .filter(() => access.can("settings.read"))
          .map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{card.title[lang]}</CardTitle>
                  <CardDescription>{card.description[lang]}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  )
}
