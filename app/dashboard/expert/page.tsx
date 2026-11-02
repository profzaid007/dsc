"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useLang } from "@/lib/lang-context"
import { CaseName } from "@/components/cases/CaseName"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format-date"

export default function ExpertDashboardPage() {
  const { currentUser } = useAuth()
  const { lang } = useLang(), ar = lang === "ar"
  const { profiles, isLoading, loadError, refresh } = useProfiles(currentUser?.role === "expert")
  const tasks = useAssignments()
  if (isLoading) return <PageLoader />
  if (loadError) return <DataError message={loadError} onRetry={refresh} />
  const caseIds = new Set(profiles.map(profile => profile.id))
  const assignedTasks = tasks.assignments.filter(task => caseIds.has(task.case))
  const taskCount = (statuses: string[]) => tasks.isLoading ? "…" : tasks.loadError ? "—" : assignedTasks.filter(task => statuses.includes(task.status)).length
  const recent = [...profiles].sort((a,b) => (Date.parse(b.created) || 0) - (Date.parse(a.created) || 0)).slice(0,5)
  const stats = [
    { label: ar ? "الحالات المسندة" : "Assigned cases", value: profiles.length, icon: Users },
    { label: ar ? "تكليفات الأدوات بانتظار البدء" : "Pending tool assignments", value: taskCount(["pending"]), icon: AlertCircle },
    { label: ar ? "تكليفات الأدوات النشطة" : "Active tool assignments", value: taskCount(["assigned", "in_progress"]), icon: Clock },
    { label: ar ? "تكليفات الأدوات المكتملة" : "Completed tool assignments", value: taskCount(["completed"]), icon: CheckCircle },
  ]
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{ar ? "لوحة تحكم الخبير" : "Expert Dashboard"}</h1><p className="text-muted-foreground">{ar ? "مرحبًا بعودتك،" : "Welcome back,"} {currentUser?.name}</p></div><Button variant="outline" onClick={() => { void refresh(); void tasks.refresh() }}>{ar ? "تحديث" : "Refresh"}</Button></div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle><Icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>)}</div>
    {tasks.loadError && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm"><p>{ar ? "تعذر تحميل إحصاءات التكليفات: " : "Could not load assignment counts: "}{tasks.loadError}</p><Button variant="link" onClick={() => void tasks.refresh()}>{ar ? "إعادة المحاولة" : "Retry"}</Button></div>}
    <Card><CardHeader className="flex flex-row items-center justify-between gap-3"><CardTitle>{ar ? "أحدث الحالات المسندة" : "Recent assigned cases"}</CardTitle><Link className="text-sm text-primary underline" href="/dashboard/expert/cases">{ar ? "عرض جميع الحالات" : "View all cases"}</Link></CardHeader><CardContent>{recent.length ? <ul className="divide-y">{recent.map(profile => <li key={profile.id}><Link href={`/dashboard/expert/cases/${encodeURIComponent(profile.id)}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg p-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><span className="font-semibold [overflow-wrap:anywhere]"><CaseName profile={profile} /></span><span className="text-xs text-muted-foreground">{formatDate(profile.created)}</span></Link></li>)}</ul> : <p className="text-sm text-muted-foreground">{ar ? "لا توجد حالات مسندة إليك بعد." : "No cases assigned yet."}</p>}</CardContent></Card>
  </div>
}
