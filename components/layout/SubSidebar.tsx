"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

type SubSidebarItem = {
  name: string
  href: string
  icon: LucideIcon
}

type SubSidebarProps = {
  title: string
  items: SubSidebarItem[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}

const STORAGE_KEY_PREFIX = "subsidebar"

function getStoredCollapsed(title: string, defaultCollapsed: boolean): boolean {
  if (typeof window === "undefined") return defaultCollapsed
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${title}-collapsed`)
  if (stored !== null) return stored === "true"
  return defaultCollapsed
}

export function SubSidebar({ title, items, collapsible = false, defaultCollapsed = false }: SubSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(() => getStoredCollapsed(title, defaultCollapsed))

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(`${STORAGE_KEY_PREFIX}-${title}-collapsed`, String(next))
      return next
    })
  }

  return (
    <aside
      className={cn(
        "flex min-h-screen flex-col border-r bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("border-b", isCollapsed ? "p-2" : "p-4")}>
        {collapsible ? (
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
            {!isCollapsed && <h2 className="text-lg font-semibold text-primary">{title}</h2>}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1", isCollapsed ? "p-2" : "p-3")}>
        {items.map((item) => {

          const activeItem = items
            .filter(item => pathname === item.href || pathname.startsWith(item.href + "/"))
            .sort((a, b) => b.href.length - a.href.length)[0]

          const isActive = activeItem?.href === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                isCollapsed ? "justify-center px-0 py-2" : "px-3 py-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
