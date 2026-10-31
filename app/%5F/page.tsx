"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LocalizedText } from "@/components/LocalizedText"

// Older PocketBase emails used its dashboard fragment on the website domain.
export default function LegacyPasswordResetPage() {
  const router = useRouter()

  useEffect(() => {
    const match = window.location.hash.match(
      /^#\/auth\/confirm-password-reset\/([^/?#]+)\/?$/
    )
    router.replace(
      match
        ? `/reset-password?token=${encodeURIComponent(match[1])}`
        : "/reset-password"
    )
  }, [router])

  return <p className="p-6"><LocalizedText text="Loading..." /></p>
}
