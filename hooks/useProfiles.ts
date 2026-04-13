"use client"

import { useState, useEffect, useCallback } from "react"
import { casesCollection } from "@/lib/pb-collections"
import type { Profile } from "@/types/profile"
import { getCurrentUser } from "@/lib/pb"


export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const currentUser = getCurrentUser()

  const fetchProfiles = useCallback(async () => {
    try {
      let data: Profile[]
      if (currentUser && currentUser.isAdmin === false) {
        data = await casesCollection.getByUser(currentUser.id)
      } else {
        data = await casesCollection.getAll()
      }
      setProfiles(data)
    } catch (error) {
      console.error("Failed to fetch profiles:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const addProfile = async (data: Partial<Profile>) => {
    try {
      const newProfile = await casesCollection.create({
        ...data,
        user: currentUser?.id,
      } as any)
      setProfiles((prev) => [...prev, newProfile])
      return newProfile.id
    } catch (error) {
      console.error("Failed to create profile:", error)
      throw error
    }
  }

  const updateProfile = async (id: string, data: Partial<Profile>) => {
    try {
      const updated = await casesCollection.update(id, data)
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (error) {
      console.error("Failed to update profile:", error)
      throw error
    }
  }

  const deleteProfile = async (id: string) => {
    try {
      await casesCollection.delete(id)
      setProfiles((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete profile:", error)
      throw error
    }
  }

  const getProfileById = (id: string) => profiles.find((p) => p.id === id)

  const getProfilesByUser = (userId: string) =>
    profiles.filter((p) => p.user === userId)

  return {
    profiles,
    isLoading,
    addProfile,
    updateProfile,
    deleteProfile,
    getProfileById,
    getProfilesByUser,
    refresh: fetchProfiles,
  }
}
