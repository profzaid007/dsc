"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  disabled?: boolean
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Info Pages",
    href: "/cms/info",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Blog",
    href: "/cms/blog",
    icon: <Newspaper className="h-4 w-4" />,
    disabled: true,
  },
]

export function CmsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-white">
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
              {item.label}
              {item.disabled && (
                <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  Soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
