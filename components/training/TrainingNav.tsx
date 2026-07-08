"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLang } from "@/lib/lang-context"
import { GraduationCap, Award } from "lucide-react"

const navItems = [
  {
    name: { en: "Programs", ar: "البرامج" },
    href: "/dashboard/training",
    icon: GraduationCap,
  },
  {
    name: { en: "My Certificates", ar: "شهاداتي" },
    href: "/dashboard/training/certificates",
    icon: Award,
  },
]

export function TrainingNav() {
  const pathname = usePathname()
  const { lang } = useLang()

  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard/training" && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name[lang]}
          </Link>
        )
      })}
    </div>
  )
}
