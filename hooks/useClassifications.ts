"use client"
import { useCallback, useEffect, useState } from "react"
import {
  getClassificationDefinitions,
  type ClassificationDefinition,
} from "@/lib/classifications-data"

export function useClassifications() {
  const [main, setMain] = useState<ClassificationDefinition[]>([])
  useEffect(() => {
    let active = true
    let revision = 0
    const load = () => {
      const generation = ++revision
      void getClassificationDefinitions()
        .then((data) => {
          if (active && generation === revision) setMain(data)
        })
        .catch(() => {
          /* Keep the last verified list on transient failure. */
        })
    }
    load()
    window.addEventListener("dsc:classifications-changed", load)
    return () => {
      active = false
      window.removeEventListener("dsc:classifications-changed", load)
    }
  }, [])
  const label = useCallback(
    (key: string, lang: "ar" | "en") =>
      main.find((c) => c.key === key)?.[lang] || key,
    [main]
  )
  return {
    main: main.filter((c) => c.is_active),
    experts: main.filter((c) => c.is_active && !c.media_only),
    groups: main
      .filter((c) => c.is_active && !c.media_only)
      .map((c) => ({ id: c.key, en: c.en, ar: c.ar })),
    label,
  }
}
