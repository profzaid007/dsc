"use client"
import { getErrorMessage } from "@/lib/pb"
import { useCallback, useEffect, useState } from "react"
import {
  getClassificationDefinitions,
  type ClassificationDefinition,
} from "@/lib/classifications-data"

export function useClassifications() {
  const [main, setMain] = useState<ClassificationDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const refresh = useCallback(() => setReloadKey(value => value + 1), [])
  useEffect(() => {
    let active = true
    let revision = 0
    const load = () => {
      const generation = ++revision
      setIsLoading(true)
      setError("")
      void getClassificationDefinitions()
        .then((data) => {
          if (active && generation === revision) setMain(data)
        })
        .catch((err: unknown) => {
          if (active && generation === revision) {
            setMain([])
            setError(`specialist_role_categories: ${getErrorMessage(err)}`)
          }
        })
        .finally(() => { if (active && generation === revision) setIsLoading(false) })
    }
    load()
    window.addEventListener("dsc:classifications-changed", load)
    return () => {
      active = false
      window.removeEventListener("dsc:classifications-changed", load)
    }
  }, [reloadKey])
  const label = useCallback(
    (key: string, lang: "ar" | "en") =>
      main.find((c) => c.key === key)?.[lang] || key,
    [main]
  )
  return {
    isLoading, error, refresh,
    main: main.filter((c) => c.is_active),
    experts: main.filter((c) => c.is_active && !c.media_only),
    groups: main
      .filter((c) => c.is_active && !c.media_only)
      .map((c) => ({ id: c.key, en: c.en, ar: c.ar })),
    label,
  }
}
