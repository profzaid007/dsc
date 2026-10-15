"use client"
import { useEffect, useState } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import { toast } from "sonner"

/** Refresh short-lived file tokens for inline private media and reset on auth changes. */
export function useProtectedFileToken(enabled = true) {
  const [state, setState] = useState({ auth: "", token: "" })
  useEffect(() => {
    if (!enabled) return
    let revision = 0
    let disposed = false
    async function refresh() {
      const auth = pb.authStore.isValid ? pb.authStore.token : ""
      const generation = ++revision
      if (!auth) {
        setState({ auth: "", token: "" })
        return
      }
      try {
        const token = await pb.files.getToken()
        if (!disposed && generation === revision && auth === pb.authStore.token)
          setState({ auth, token })
      } catch (error) {
        if (!disposed && generation === revision) {
          setState({ auth: "", token: "" })
          toast.error(getErrorMessage(error))
        }
      }
    }
    const unsubscribe = pb.authStore.onChange(() => {
      setState({ auth: "", token: "" })
      void refresh()
    })
    void refresh()
    const timer = window.setInterval(() => void refresh(), 60000)
    const onFocus = () => void refresh()
    window.addEventListener("focus", onFocus)
    return () => {
      disposed = true
      revision++
      unsubscribe()
      clearInterval(timer)
      window.removeEventListener("focus", onFocus)
    }
  }, [enabled])
  return enabled && state.auth === pb.authStore.token ? state.token : ""
}
