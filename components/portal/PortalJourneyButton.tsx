"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { portalJourneyHref } from "@/lib/portal-journey"
import type { BilingualString } from "@/types/form"

export function PortalJourneyButton({
  portalId,
  registrationType,
  label,
  className,
  style,
}: {
  portalId: string
  registrationType?: "care_foundation" | "parent" | "individual" | "organization" | "expert" | "all"
  label: BilingualString
  className?: string
  style?: CSSProperties
}) {
  const { currentUser, isAuthenticated } = useAuth()
  const { lang } = useLang()
  return (
    <Button
      size="lg"
      className={className}
      style={style}
      asChild
    >
      <Link href={portalJourneyHref(portalId, isAuthenticated ? currentUser?.role : undefined, registrationType)}>{t(label, lang)}</Link>
    </Button>
  )
}
