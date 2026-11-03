"use client"
import { useEffect, useState } from "react"
import pb from "@/lib/pb"
export function useUnreadMessages(userId?: string, enabled = false) {
  const [result, setResult] = useState<{ userId: string; count: number } | null>(null)
  useEffect(() => {
    if (!userId || !enabled) return
    let active = true
    let generation = 0
    async function refresh() {
      const request = ++generation
      try {
        const data = await pb.collection("internal_messages").getList(1, 1, { filter: pb.filter("recipient = {:id} && read = false", { id: userId }), requestKey: null })
        if (active && request === generation) setResult({ userId: userId!, count: data.totalItems })
      } catch { if (active && request === generation) setResult({ userId: userId!, count: 0 }) }
    }
    void refresh()
    const interval = setInterval(refresh, 30000)
    window.addEventListener("messages-updated", refresh)
    return () => { active = false; clearInterval(interval); window.removeEventListener("messages-updated", refresh) }
  }, [userId, enabled])
  return enabled && result && result.userId === userId ? result.count : 0
}
