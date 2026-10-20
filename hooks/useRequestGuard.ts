"use client"
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react"
import pb from "@/lib/pb"
const subscribe = (notify: () => void) => pb.authStore.onChange(() => notify())
const snapshot = () => `${pb.authStore.record?.id || ""}:${pb.authStore.token}`
/** A response belongs to one auth identity, scope and request generation only. */
export function useRequestGuard(scope = "") {
  const auth = useSyncExternalStore(subscribe, snapshot, () => "")
  const key = auth + ":" + scope
  const current = useRef({ key, generation: 0 })
  useEffect(() => {
    current.current.key = key
    return () => {
      current.current.generation++
    }
  }, [key])
  return useCallback(() => {
    const generation = ++current.current.generation
    return () =>
      current.current.key === key &&
      current.current.generation === generation &&
      snapshot() === auth
  }, [key, auth])
}
