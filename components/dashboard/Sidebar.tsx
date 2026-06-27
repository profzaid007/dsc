"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SmartLink } from "@/components/smart-link"
import {
  LayoutDashboard,
  Users,
  Wrench,
  LogOut,
  FolderKanban,
  ClipboardList,
  GraduationCap,
  BookOpen,
  Settings,
} from "lucide-react"

const adminNavigation = [
  {
    name: { en: "Tools", ar: "الأدوات" },
    href: "/dashboard/admin/tools",
    icon: Wrench,
  },
  {
    name: { en: "Assignments", ar: "التعيينات" },
    href: "/dashboard/admin/assignments",
    icon: ClipboardList,
  },
  {
    name: { en: "Training", ar: "التدريب" },
    href: "/dashboard/admin/training",
    icon: GraduationCap,
  },
  {
    name: { en: "Public Lectures", ar: "المحاضرات العامة" },
    href: "/dashboard/admin/public-lectures",
    icon: BookOpen,
  },
  {
    name: { en: "Settings", ar: "الإعدادات" },
    href: "/dashboard/admin/settings",
    icon: Settings,
    superAdminOnly: true,
  },
]

type NavItem = {
  name: { en: string; ar: string }
  href: string
  icon: typeof LayoutDashboard
  superAdminOnly?: boolean
}

function renderNavItem(
  item: NavItem,
  pathname: string,
  isMain: boolean = false
) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/")

  return (
    <SmartLink
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
    </SmartLink>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    currentUser,
    isAdmin,
    isSuperAdmin,
    logout,
    isLoading: isAuthLoading,
  } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-primary text-primary-foreground">
      <div className="border-b border-primary/20 p-4">
        <SmartLink href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">DSC</span>
        </SmartLink>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {/* Dashboard - shown for both admin and user */}
        <SmartLink
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "bg-white/20 text-white"
              : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </SmartLink>

        {/* Cases - shown for both admin and user */}
        <SmartLink
          href={isAdmin ? "/dashboard/admin/cases" : "/dashboard/cases"}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/cases" ||
              pathname === "/dashboard/admin/cases" ||
              pathname.startsWith("/dashboard/admin/cases/")
              ? "bg-white/20 text-white"
              : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <Users className="h-5 w-5" />
          Cases
        </SmartLink>

        {/* Training - shown for both admin and user */}
        <SmartLink
          href="/dashboard/training"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/training" ||
              pathname.startsWith("/dashboard/training/")
              ? "bg-white/20 text-white"
              : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <GraduationCap className="h-5 w-5" />
          Training
        </SmartLink>

        {/* Public Lectures - shown for both admin and user */}
        <SmartLink
          href="/dashboard/public-lectures"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/public-lectures" ||
              pathname.startsWith("/dashboard/public-lectures/")
              ? "bg-white/20 text-white"
              : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <BookOpen className="h-5 w-5" />
          Public Lectures
        </SmartLink>

        {/* Admin section - only for admins */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-medium tracking-wider text-primary-foreground/50 uppercase">
                Admin
              </span>
            </div>
            {adminNavigation.map((item) => {
              if (item.superAdminOnly && !isSuperAdmin) return null
              return renderNavItem(item, pathname, true)
            })}
          </>
        )}
      </nav>

      <div className="border-t border-primary/20 p-4">
        {isAuthLoading ? (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-white/10">
              <FolderKanban className="h-5 w-5 opacity-50" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3.5 w-20 animate-pulse rounded bg-white/10" />
              <div className="h-2.5 w-28 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {currentUser?.name}
              </p>
              <p className="truncate text-xs text-primary-foreground/70">
                {currentUser?.email}
              </p>
            </div>
          </div>
        )}
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
