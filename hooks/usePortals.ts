"use client"
import { useCallback, useEffect, useState } from "react"
import { useInitialPublicPortals } from "@/lib/public-portals-context"
import { getPortals } from "@/lib/portal-data"
import type { Portal } from "@/lib/portals"
export function usePortals(includeDeleted = false) {
  const context = useInitialPublicPortals()
  const initial = includeDeleted ? null : context
  const [portals, setPortals] = useState<Portal[]>(initial?.portals || [])
  const [isLoading, setLoading] = useState(!initial)
  const [error, setError] = useState<string | null>(initial?.error || null)
  const reload = useCallback(async (background = false) => {
    if (!background) setLoading(true)
    setError(null)
    try {
      setPortals(await getPortals(includeDeleted))
    } catch {
      setError("Unable to load portals.")
    } finally {
      if (!background) setLoading(false)
    }
  }, [includeDeleted])
  useEffect(() => {
    const timer = initial ? undefined : window.setTimeout(() => void reload(), 0)
    // Returning from the native file chooser fires focus. Refresh data without
    // replacing the editor (and its file input) with a loading screen.
    const refresh = () => void reload(true)
    window.addEventListener("portals-updated", refresh)
    window.addEventListener("focus", refresh)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("portals-updated", refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [reload, initial])
  return { portals, isLoading, error, reload }
}
