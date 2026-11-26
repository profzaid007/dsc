"use client"

import { PublicPortalsContext, type PublicPortalsState } from "@/lib/public-portals-context"
import { Toaster } from "sonner"
import { LangProvider, useLang } from "@/lib/lang-context"
import { DirectionProvider } from "@/components/form/DirectionProvider"
import { Navbar } from "@/components/layout/Navbar"
import { FooterSection } from "@/components/landing/FooterSection"
import { AccessibilityControls } from "@/components/AccessibilityControls"
import type { Lang } from "@/types/form"

function Shell({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()

  return (
    <DirectionProvider lang={lang}>
      <Toaster position="top-center" richColors closeButton />
      <div className="flex min-h-svh flex-col bg-transparent">
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <FooterSection />
        <AccessibilityControls />
      </div>
    </DirectionProvider>
  )
}

export function AppShell({
  children,
  initialLang,
  publicPortals,
}: {
  children: React.ReactNode
  initialLang?: Lang
  publicPortals?: PublicPortalsState
}) {
  return (
    <PublicPortalsContext.Provider value={publicPortals || null}>
    <LangProvider initialLang={initialLang}>
      <Shell>{children}</Shell>
    </LangProvider>
    </PublicPortalsContext.Provider>
  )
}
