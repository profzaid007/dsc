"use client"

import { SubSidebar } from "@/components/layout/SubSidebar"
import {
  Home,
  BookOpen,
  Lightbulb,
  Award,
  ClipboardList,
  FileBarChart,
  Calendar,
} from "lucide-react"

const trainingNavItems = [
  { name: "Overview", href: "/dashboard/admin/training", icon: Home },
  { name: "Programs", href: "/dashboard/admin/training/programs", icon: BookOpen },
  { name: "Awareness", href: "/dashboard/admin/training/awareness", icon: Lightbulb },
  { name: "Certificates", href: "/dashboard/admin/training/certificates", icon: Award },
  { name: "Registration", href: "/dashboard/admin/training/registration", icon: ClipboardList },
  { name: "Reports", href: "/dashboard/admin/training/reports", icon: FileBarChart },
  { name: "Scheduling", href: "/dashboard/admin/training/scheduling", icon: Calendar },
]

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <SubSidebar title="Training" items={trainingNavItems} />
      <main className="flex-1 bg-muted/30 p-6">{children}</main>
    </div>
  )
}