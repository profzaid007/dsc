"use client"
import { createContext, useContext } from "react"
import type { Portal } from "@/lib/portals"
export type PublicPortalsState = { portals: Portal[]; error: string | null }
export const PublicPortalsContext = createContext<PublicPortalsState | null>(null)
export const useInitialPublicPortals = () => useContext(PublicPortalsContext)
