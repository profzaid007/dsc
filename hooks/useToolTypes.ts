"use client"

import { useState, useCallback } from "react"
import { toolTypesCollection } from "@/lib/pb-collections"
import type { ToolTypeRecord } from "@/lib/tool-types"
import type { BilingualString } from "@/types/tool"

export function useToolTypes() {
  const [toolTypes, setToolTypes] = useState<ToolTypeRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchToolTypes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await toolTypesCollection.getAll()
      setToolTypes(data)
      return data
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch tool types"
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getToolTypeById = useCallback(
    (id: string | undefined): ToolTypeRecord | undefined => {
      if (!id) return undefined
      return toolTypes.find((t) => t.id === id)
    },
    [toolTypes]
  )

  const getToolTypeByKey = useCallback(
    (key: string | undefined): ToolTypeRecord | undefined => {
      if (!key) return undefined
      return toolTypes.find((t) => t.key === key)
    },
    [toolTypes]
  )

  const getToolTypeByIdAsync = useCallback(
    async (id: string | undefined): Promise<ToolTypeRecord | undefined> => {
      if (!id) return undefined
      // First check cache
      const cached = toolTypes.find((t) => t.id === id)
      if (cached) return cached
      // Fetch from DB
      try {
        return await toolTypesCollection.getById(id)
      } catch {
        return undefined
      }
    },
    [toolTypes]
  )

  const getToolTypeLabel = useCallback(
    (
      toolType: ToolTypeRecord | undefined,
      lang: keyof BilingualString = "en"
    ) => {
      if (!toolType) return "Unknown"
      return toolType.label[lang] || toolType.label.en || toolType.key
    },
    []
  )

  return {
    toolTypes,
    isLoading,
    error,
    fetchToolTypes,
    getToolTypeById,
    getToolTypeByKey,
    getToolTypeByIdAsync,
    getToolTypeLabel,
  }
}
