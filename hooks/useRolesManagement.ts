"use client"

import { useState, useEffect, useCallback } from "react"
import { rolesManagementCollection } from "@/lib/pb-collections"
import type { RolesManagement } from "@/types/expert-role"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/pb"

export function useRolesManagement() {
  const [roles, setRoles] = useState<RolesManagement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRoles = useCallback(async () => {
    try {
      const data = await rolesManagementCollection.getAll()
      setRoles(data)
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      toast.error(getErrorMessage(error))
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

  const updateRole = useCallback(
    async (id: string, roleNameEn: string, roleNameAr: string) => {
      const updated = await rolesManagementCollection.update(id, {
        role_name_en: roleNameEn,
        role_name_ar: roleNameAr,
      })
      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
      )
      return updated
    },
    []
  )

  const addRole = useCallback(
    async (roleNameEn: string, roleNameAr: string) => {
      const created = await rolesManagementCollection.create({
        role_name_en: roleNameEn,
        role_name_ar: roleNameAr,
      })
      setRoles((prev) => [...prev, created])
      return created
    },
    []
  )

  const removeRole = useCallback(async (id: string) => {
    await rolesManagementCollection.delete(id)
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return {
    roles,
    isLoading,
    updateRoleToolTypes,
    updateRole,
    addRole,
    removeRole,
    refresh: fetchRoles,
  }
}
