"use client"

import { SubSidebar } from "@/components/layout/SubSidebar"
import {
  Home,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CheckSquare,
} from "lucide-react"

const committeesNavItems = [
  { name: "Overview", href: "/dashboard/admin/committees", icon: Home },
  { name: "Dashboard", href: "/dashboard/admin/committees/dashboard", icon: LayoutDashboard },
  { name: "Management", href: "/dashboard/admin/committees/management", icon: Users },
  { name: "Meetings", href: "/dashboard/admin/committees/meetings", icon: Calendar },
  { name: "Documents", href: "/dashboard/admin/committees/documents", icon: FileText },
  { name: "Tasks", href: "/dashboard/admin/committees/tasks", icon: CheckSquare },
]

export default function CommitteesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <SubSidebar title="Committees" items={committeesNavItems} />
      <main className="flex-1 bg-muted/30 p-6">{children}</main>
    </div>
  )
}
