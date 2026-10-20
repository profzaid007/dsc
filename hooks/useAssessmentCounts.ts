"use client"
import { useCallback, useEffect, useState } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import { useRequestGuard } from "./useRequestGuard"
export function useAssessmentCounts(enabled = true) {
  const [sessions, setSessions] = useState<
    { case: string; status: string; count: number }[]
  >([])
  const [error, setError] = useState("")
  const begin = useRequestGuard(String(enabled))
  const reload = useCallback(async () => {
    const valid = begin()
    setSessions([])
    setError("")
    if (!enabled) return
    try {
      const result = await pb.send<{
        items: { case: string; status: string; count: number }[]
      }>("/api/dsc/assessment-session-counts", { method: "GET" })
      if (valid()) setSessions(result.items)
    } catch (e) {
      if (valid()) setError(getErrorMessage(e))
    }
  }, [begin, enabled])
  useEffect(() => {
    void reload()
  }, [reload])
  return { sessions, error, reload }
}
