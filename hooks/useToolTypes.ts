"use client"

import { useState, useCallback } from "react"
import { toolTypesCollection } from "@/lib/pb-collections"

interface ToolType {
  id: string
  name: string
}

export function useToolTypes() {
  const [toolTypes, setToolTypes] = useState<ToolType[]>([])
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
    (id: string | undefined): ToolType | undefined => {
      if (!id) return undefined
      return toolTypes.find((t) => t.id === id)
    },
    [toolTypes]
  )

  const getToolTypeByIdAsync = useCallback(
    async (id: string | undefined): Promise<ToolType | undefined> => {
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

  return {
    toolTypes,
    isLoading,
    error,
    fetchToolTypes,
    getToolTypeById,
    getToolTypeByIdAsync,
  }
}
