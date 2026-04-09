"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Wrench,
  Settings,
  LogOut,
  FolderKanban,
  FileText,
  ListTodo,
  Image,
  FileBarChart,
  Layers,
} from "lucide-react"

const navigation = [
  {
    name: { en: "Dashboard", ar: "لوحة التحكم" },
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: { en: "Profiles", ar: "الملفات الشخصية" },
    href: "/dashboard/profiles",
    icon: Users,
  },
]

const adminNavigation = [
  {
    name: { en: "Tools", ar: "الأدوات" },
    href: "/dashboard/admin/tools",
    icon: Wrench,
  },
]

type NavItem = {
  name: { en: string; ar: string }
  href: string
  icon: typeof LayoutDashboard
  children?: NavItem[]
}

function renderNavItem(
  item: NavItem,
  pathname: string,
  isMain: boolean = false
) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/")

  return (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-white/20 text-white"
          : "text-primary-foreground/70 hover:bg-white/10 hover:text-white",
        isMain && "ps-8"
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.name.en}
    </Link>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, isAdmin, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-primary text-primary-foreground">
      <div className="border-b border-primary/20 p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">DSC</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {

          const isActive =
            pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name.en}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-medium tracking-wider text-primary-foreground/50 uppercase">
                Admin
              </span>
            </div>
            {adminNavigation.map((item) => renderNavItem(item, pathname, true))}
          </>
        )}
      </nav>

      <div className="border-t border-primary/20 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{currentUser?.name}</p>
            <p className="truncate text-xs text-primary-foreground/70">
              {currentUser?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-primary-foreground/70 hover:bg-white/10 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="me-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
