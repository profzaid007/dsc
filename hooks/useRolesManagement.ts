"use client"

import { useState, useEffect, useCallback } from "react"
import { rolesManagementCollection } from "@/lib/pb-collections"
import type { RolesManagement } from "@/types/expert-role"

export function useRolesManagement() {
  const [roles, setRoles] = useState<RolesManagement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRoles = useCallback(async () => {
    try {
      const data = await rolesManagementCollection.getAll()
      setRoles(data)
    } catch (error) {
      console.error("Failed to fetch roles:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const updateRoleTools = useCallback(
    async (id: string, toolIds: string[]) => {
      const updated = await rolesManagementCollection.update(id, {
        tools: toolIds,
      })
      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
      )
    },
    []
  )

  return {
    roles,
    isLoading,
    updateRoleTools,
    refresh: fetchRoles,
  }
}
