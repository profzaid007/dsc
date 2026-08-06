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

  const updateRoleToolTypes = useCallback(
    async (id: string, toolTypeIds: string[]) => {
      const updated = await rolesManagementCollection.update(id, {
        tool_types: toolTypeIds,
      })
      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
      )
    },
    []
  )

  const addRole = useCallback(async (name: string) => {
    const created = await rolesManagementCollection.create({ name })
    setRoles((prev) => [...prev, created])
    return created
  }, [])

  const removeRole = useCallback(async (id: string) => {
    await rolesManagementCollection.delete(id)
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return {
    roles,
    isLoading,
    updateRoleToolTypes,
    addRole,
    removeRole,
    refresh: fetchRoles,
  }
}
