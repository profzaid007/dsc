"use client"

import { AdminProtectedRoute } from "@/components/dashboard/AdminProtectedRoute"
import { CmsSidebar } from "@/components/cms/CmsSidebar"

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProtectedRoute>
      <div className="flex flex-1">
        <CmsSidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </AdminProtectedRoute>
  )
}
