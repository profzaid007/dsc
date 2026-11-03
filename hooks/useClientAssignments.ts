"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import pb, { getErrorMessage } from "@/lib/pb"
import { isClientRole, type ClientAssignmentData } from "@/lib/client-services"

export function useClientAssignments(enabled = true) {
  const { currentUser } = useAuth()
  const { lang } = useLang()
  const identity = currentUser?.id && isClientRole(currentUser.role) ? `${currentUser.id}:${currentUser.role}` : ""
  const [reload, setReload] = useState(0)
  const [state, setState] = useState<{ identity: string; data: ClientAssignmentData | null; error: string; loading: boolean }>({ identity: "", data: null, error: "", loading: true })
  useEffect(() => {
    if (!enabled || !identity) return
    let active = true
    const controller = new AbortController()
    queueMicrotask(() => { if (active) setState({ identity, data: null, error: "", loading: true }) })
    pb.send<ClientAssignmentData>("/api/dsc/my-assignments", { method: "GET", signal: controller.signal, requestKey: null })
      .then(data => { if (active) setState({ identity, data, error: "", loading: false }) })
      .catch(error => { if (active) setState({ identity, data: null, error: getErrorMessage(error, lang), loading: false }) })
    return () => { active = false; controller.abort() }
  }, [enabled, identity, lang, reload])
  const refresh = useCallback(() => setReload(value => value + 1), [])
  const current = enabled && identity && state.identity === identity ? state : null
  return { data: current?.data || null, error: current?.error || "", isLoading: Boolean(enabled && identity && (!current || current.loading)), refresh }
}
