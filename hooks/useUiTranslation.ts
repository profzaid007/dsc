"use client"

import { useLang } from "@/lib/lang-context"
import { translateUi } from "@/lib/ui-translations"

export function useUiTranslation() {
  const { lang } = useLang()
  return (text: string) => translateUi(text, lang)
}
