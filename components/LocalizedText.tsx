"use client"

import { useUiTranslation } from "@/hooks/useUiTranslation"

/** Allows server-rendered page shells to share the current interface language. */
export function LocalizedText({ text }: { text: string }) {
  const ui = useUiTranslation()
  return ui(text)
}
