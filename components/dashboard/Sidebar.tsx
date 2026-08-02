"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import type { Lang } from "@/types/form"
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
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck,
} from "lucide-react"

const adminNavigation = [
  {
    name: { en: "Users", ar: "المستخدمون" },
    href: "/dashboard/admin/users",
    icon: Users,
  },
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
    name: { en: "Allocations", ar: "التخصيصات" },
    href: "/dashboard/admin/allocations",
    icon: UserCheck,
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
  lang: Lang,
  isMain: boolean = false,
  isCollapsed: boolean = false
) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/")

  return (
    <SmartLink
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
        isCollapsed ? "justify-center px-0 py-2" : "px-3 py-2",
        isActive
          ? "bg-white/20 text-white"
          : "text-primary-foreground/70 hover:bg-white/10 hover:text-white",
        isMain && !isCollapsed && "ps-8"
      )}
      title={isCollapsed ? item.name[lang] : undefined}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && item.name[lang]}
    </SmartLink>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang } = useLang()
  const {
    currentUser,
    isAdmin,
    isSuperAdmin,
    logout,
    isLoading: isAuthLoading,
  } = useAuth()

  const isExpert = currentUser?.role === "expert"

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar-dashboard-collapsed")
      if (stored !== null) return stored === "true"
    }
    return false
  })

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("sidebar-dashboard-collapsed", String(next))
      return next
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "flex min-h-screen flex-col bg-primary text-primary-foreground transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("border-b border-primary/20", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <SmartLink href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold">DSC</span>
            </SmartLink>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="text-primary-foreground/70 hover:bg-white/10 hover:text-white"
            aria-label={
              isCollapsed
                ? lang === "ar"
                  ? "توسيع الشريط الجانبي"
                  : "Expand sidebar"
                : lang === "ar"
                  ? "طي الشريط الجانبي"
                  : "Collapse sidebar"
            }
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className={cn("flex-1 space-y-1", isCollapsed ? "p-2" : "p-4")}>
        {/* Dashboard - shown for both admin and user */}
        <SmartLink
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
            isCollapsed ? "justify-center px-0 py-2" : "px-3 py-2",
            pathname === "/dashboard"
              ? "bg-white/20 text-white"
              : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
          )}
          title={isCollapsed ? (lang === "ar" ? "لوحة التحكم" : "Dashboard") : undefined}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {!isCollapsed && (lang === "ar" ? "لوحة التحكم" : "Dashboard")}
        </SmartLink>

        {/* Cases - shown for both admin and user */}
        <SmartLink
          href={isAdmin || isExpert ? "/dashboard/admin/cases" : "/dashboard/cases"}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
            isCollapsed ? "justify-center px-0 py-2" : "px-3 py-2",
            pathname === "/dashboard/cases" ||
              pathname === "/dashboard/admin/cases" ||
              pathname.startsWith("/dashboard/admin/cases/")
              ? "bg-white/20 text-white"
              : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
          )}
          title={isCollapsed ? (lang === "ar" ? "الحالات" : "Cases") : undefined}
        >
          <Users className="h-5 w-5 shrink-0" />
          {!isCollapsed && (lang === "ar" ? "الحالات" : "Cases")}
        </SmartLink>

        {/* Expert section - only for experts */}
        {isExpert && (
          <>
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-medium tracking-wider text-primary-foreground/50 uppercase">
                  {lang === "ar" ? "خبير" : "Expert"}
                </span>
              </div>
            )}
            {renderNavItem(
              {
                name: { en: "Tools", ar: "الأدوات" },
                href: "/dashboard/admin/tools",
                icon: Wrench,
              },
              pathname,
              lang,
              true,
              isCollapsed
            )}
            {renderNavItem(
              {
                name: { en: "Assignments", ar: "التعيينات" },
                href: "/dashboard/admin/assignments",
                icon: ClipboardList,
              },
              pathname,
              lang,
              true,
              isCollapsed
            )}
          </>
        )}

        {/* Admin section - only for admins */}
        {isAdmin && (
          <>
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-medium tracking-wider text-primary-foreground/50 uppercase">
                  {lang === "ar" ? "مشرف" : "Admin"}
                </span>
              </div>
            )}
            {adminNavigation.map((item) => {
              if (item.superAdminOnly && !isSuperAdmin) return null
              return renderNavItem(item, pathname, lang, true, isCollapsed)
            })}
          </>
        )}
      </nav>

      <div className={cn("border-t border-primary/20", isCollapsed ? "p-2" : "p-4")}>
        {isAuthLoading ? (
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-white/10">
              <FolderKanban className="h-5 w-5 shrink-0 opacity-50" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3.5 w-20 animate-pulse rounded bg-white/10" />
                <div className="h-2.5 w-28 animate-pulse rounded bg-white/10" />
              </div>
            )}
          </div>
        ) : (
          <div className={cn("mb-3 flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <FolderKanban className="h-5 w-5 shrink-0" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {currentUser?.name}
                </p>
                <p className="truncate text-xs text-primary-foreground/70">
                  {currentUser?.email}
                </p>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "sm"}
          className={cn(
            "text-primary-foreground/70 hover:bg-white/10 hover:text-white",
            isCollapsed ? "w-full justify-center" : "w-full justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && (lang === "ar" ? "تسجيل الخروج" : "Logout")}
        </Button>
      </div>
    </aside>
  )
}
