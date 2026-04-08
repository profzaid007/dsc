"use client"

import { useState, useEffect, useCallback } from "react"
import { caseToolsCollection } from "@/lib/pb-collections"
import type { CaseTool } from "@/types/assignment"

export function useAssignments(caseId?: string) {
  const [assignments, setAssignments] = useState<CaseTool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAssignments = useCallback(async () => {
    try {
      let data: CaseTool[]
      if (caseId) {
        data = await caseToolsCollection.getByCase(caseId)
      } else {
        data = await caseToolsCollection.getAll()
      }
      setAssignments(data)
    } catch (error) {
      console.error("Failed to fetch assignments:", error)
    } finally {
      setIsLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const assignTool = async (data: Partial<CaseTool>) => {
    try {
      const newAssignment = await caseToolsCollection.create(data)
      setAssignments((prev) => [...prev, newAssignment])
      return newAssignment.id
    } catch (error) {
      console.error("Failed to assign tool:", error)
      throw error
    }
  }

  const updateAssignment = async (id: string, data: Partial<CaseTool>) => {
    try {
      const updated = await caseToolsCollection.update(id, data)
      setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)))
    } catch (error) {
      console.error("Failed to update assignment:", error)
      throw error
    }
  }

  const deleteAssignment = async (id: string) => {
    try {
      await caseToolsCollection.delete(id)
      setAssignments((prev) => prev.filter((a) => a.id !== id))
    } catch (error) {
      console.error("Failed to delete assignment:", error)
      throw error
    }
  }

  const getAssignmentsByCase = (caseId: string) =>
    assignments.filter((a) => a.case === caseId)

  const getVisibleAssignments = (caseId: string) =>
    assignments.filter((a) => a.case === caseId && a.is_visible_to_user)

  return {
    assignments,
    isLoading,
    assignTool,
    updateAssignment,
    deleteAssignment,
    getAssignmentsByCase,
    getVisibleAssignments,
    refresh: fetchAssignments,
  }
}
