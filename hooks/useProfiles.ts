"use client"

import { useState, useEffect, useCallback } from "react"
import { casesCollection, caseExpertsCollection } from "@/lib/pb-collections"
import type { Profile } from "@/types/profile"
import { getCurrentUser } from "@/lib/pb"

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const currentUser = getCurrentUser()

  const fetchProfiles = useCallback(async () => {
    try {
      let data: Profile[]
      if (currentUser?.role === "expert") {
        const expertCases = await caseExpertsCollection.getByExpert(
          currentUser.id
        )
        const caseIds = [
          ...new Set(
            expertCases.map((ce) => ce.case_id).filter(Boolean)
          ),
        ]
        data =
          caseIds.length > 0
            ? await casesCollection.getByIds(caseIds)
            : []
      } else if (
        currentUser &&
        (currentUser.role === "user" ||
          currentUser.role === "individual" ||
          currentUser.role === "organization" ||
          currentUser.role === "parent")
      ) {
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

  const addProfile = async (data: Partial<Profile>, userId?: string) => {
    try {
      const ownerId = userId !== undefined ? userId : currentUser?.id
      const newProfile = await casesCollection.create({
        ...data,
        user: ownerId,
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
      return updated
    } catch (error) {
      console.error("Failed to update profile:", error)
      throw error
    }
  }

  const setPaymentAmount = async (id: string, amount: number) => {
    try {
      const updated = await casesCollection.update(id, {
        payment_amount: amount,
        status: "awaiting_payment",
      })
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)))
      return updated
    } catch (error) {
      console.error("Failed to set payment amount:", error)
      throw error
    }
  }

  const submitPaymentSlip = async (id: string, file: File) => {
    try {
      const updated = await casesCollection.updateWithFiles(
        id,
        { status: "under_review", payment_reject_reason: "" },
        [file]
      )
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)))
      return updated
    } catch (error) {
      console.error("Failed to submit payment slip:", error)
      throw error
    }
  }

  const approveCase = async (id: string) => {
    try {
      const updated = await casesCollection.update(id, {
        status: "active",
        is_paid: true,
        payment_reject_reason: "",
      })
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)))
      return updated
    } catch (error) {
      console.error("Failed to approve case:", error)
      throw error
    }
  }

  const rejectPayment = async (id: string, reason?: string) => {
    try {
      const updated = await casesCollection.update(id, {
        status: "awaiting_payment",
        payment_reject_reason: reason || "",
      })
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)))
      return updated
    } catch (error) {
      console.error("Failed to reject payment:", error)
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
    setPaymentAmount,
    submitPaymentSlip,
    approveCase,
    rejectPayment,
    refresh: fetchProfiles,
  }
}
