"use client"

import { LangProvider, useLang } from "@/lib/lang-context"
import { DirectionProvider } from "@/components/form/DirectionProvider"
import { Navbar } from "@/components/layout/Navbar"

function Shell({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()

  return (
    <DirectionProvider lang={lang}>
      <div className="flex min-h-svh flex-col bg-transparent">
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </DirectionProvider>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <Shell>{children}</Shell>
    </LangProvider>
  )
}
