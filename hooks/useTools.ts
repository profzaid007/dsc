"use client"

import { useState, useEffect, useCallback } from "react"
import { toolsCollection } from "@/lib/pb-collections"
import type { Tool, ToolType, ServiceType } from "@/types/tool"

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTools = useCallback(async () => {
    try {
      const data = await toolsCollection.getAll()
      setTools(data)
    } catch (error) {
      console.error("Failed to fetch tools:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  const addTool = async (data: Partial<Tool>) => {
    try {
      const newTool = await toolsCollection.create(data)
      setTools((prev) => [...prev, newTool])
      return newTool.id
    } catch (error) {
      console.error("Failed to create tool:", error)
      throw error
    }
  }

  const updateTool = async (id: string, data: Partial<Tool>) => {
    try {
      const updated = await toolsCollection.update(id, data)
      setTools((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error("Failed to update tool:", error)
      throw error
    }
  }

  const deleteTool = async (id: string) => {
    try {
      await toolsCollection.delete(id)
      setTools((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Failed to delete tool:", error)
      throw error
    }
  }

  const getToolById = (id: string) => tools.find((t) => t.id === id)

  const getToolsByType = (type: ToolType) =>
    tools.filter((t) => t.type === type)

  const getToolsByServiceType = (serviceType: ServiceType) =>
    tools.filter(
      (t) => t.serviceType === serviceType || t.serviceType === "both"
    )

  const activeTools = tools.filter((t) => t.status === "active")

  return {
    tools,
    activeTools,
    isLoading,
    addTool,
    updateTool,
    deleteTool,
    getToolById,
    getToolsByType,
    getToolsByServiceType,
    refresh: fetchTools,
  }
}
