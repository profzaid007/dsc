"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import type { BilingualString } from "@/types/form"

interface SidebarItem {
  label: BilingualString
  href: string
  icon: React.ReactNode
  disabled?: boolean
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: { en: "Home Pages", ar: "صفحات رئيسية" },
    href: "/cms/home-pages",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: { en: "Info Pages", ar: "صفحات المعلومات" },
    href: "/cms/info",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: { en: "Blog", ar: "المدونة" },
    href: "/cms/blog",
    icon: <Newspaper className="h-4 w-4" />,
  },
]

export function CmsSidebar() {
  const pathname = usePathname()
  const { lang } = useLang()

  return (
    <aside className="w-64 border-e bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold">CMS</span>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                item.disabled && "pointer-events-none opacity-50"
              )}
            >
              {item.icon}
              {t(item.label, lang)}
              {item.disabled && (
                <span className="ms-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {t({ en: "Soon", ar: "قريباً" }, lang)}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}