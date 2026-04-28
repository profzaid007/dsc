"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

type SubSidebarItem = {
  name: string
  href: string
  icon: LucideIcon
}

type SubSidebarProps = {
  title: string
  items: SubSidebarItem[]
}

export function SubSidebar({ title, items }: SubSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r bg-card">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}