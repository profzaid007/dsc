"use client"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"
const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
const Context = createContext<{ now: number; hydrated: boolean } | null>(null)

/** Keep the first browser render identical to SSR, then use the visitor's clock. */
export function PublicEventTime({
  initialNow,
  children,
}: {
  initialNow: number
  children: React.ReactNode
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot
  )
  const [now, setNow] = useState(initialNow)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])
  return (
    <Context.Provider value={{ now, hydrated }}>{children}</Context.Provider>
  )
}
export const usePublicEventTime = () => useContext(Context)
