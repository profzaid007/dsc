"use client"

import { useCallback, useEffect, useState } from "react"
import pb from "@/lib/pb"
import { loadAdminDashboard, type DashboardSnapshot } from "@/lib/admin-dashboard"
import { usePermissions } from "@/hooks/usePermissions"

type State = { key: string; revision: number; data: DashboardSnapshot | null }

export function useAdminDashboard(months: 6 | 12 = 6) {
  const access = usePermissions()
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<State>({ key: "", revision: -1, data: null })
  const permissions = [...access.permissions].sort().join(",")
  const token = pb.authStore.token
  const key = `${token}:${access.isSuperAdmin}:${permissions}:${months}`
  const ready = !access.isLoading && !access.error && !!token

  useEffect(() => {
    if (!ready) return
    const controller = new AbortController()
    const grants = new Set(permissions.split(","))
    loadAdminDashboard(pb, permission => access.isSuperAdmin || grants.has(permission), months, new Date(), controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setState({ key, revision, data })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ key, revision, data: null })
      })
    return () => controller.abort()
  }, [key, ready, permissions, months, access.isSuperAdmin, revision])

  const refresh = useCallback(() => setRevision(previous => previous + 1), [])
  const data = ready && state.key === key ? state.data : null
  const pending = state.key !== key || state.revision !== revision
  return {
    data,
    isLoading: ready && pending && !data,
    isRefreshing: ready && pending && !!data,
    refresh,
  }
}
