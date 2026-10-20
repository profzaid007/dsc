"use client"

import { useRequestGuard } from "@/hooks/useRequestGuard"
import { useState, useEffect, useCallback } from "react"
import { casesCollection, caseExpertsCollection } from "@/lib/pb-collections"
import type { Profile } from "@/types/profile"
import { toast } from "sonner"
import pb, { getCurrentUser, getErrorMessage } from "@/lib/pb"

export function useProfiles(
  enabled = true,
  scope: "cases" | "payments" = "cases"
) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const currentUser = getCurrentUser()
  const currentUserId: string | undefined = currentUser?.id
  const currentRole: string | undefined = currentUser?.role

  const beginRequest = useRequestGuard(
    `${currentUserId}:${currentRole}:${enabled}:${scope}`
  )

  const fetchProfiles = useCallback(async () => {
    const isCurrent = beginRequest()
    setProfiles([])

    if (!enabled) {
      setProfiles([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setLoadError("")
    try {
      let data: Profile[]
      if (scope === "payments") {
        data = await pb.send<Profile[]>("/api/dsc/payments", { method: "GET" })
      } else if (currentRole === "expert") {
        const expertCases = await caseExpertsCollection.getByExpert(
          currentUserId!
        )
        const caseIds = [
          ...new Set(expertCases.map((ce) => ce.case_id).filter(Boolean)),
        ]
        data = caseIds.length > 0 ? await casesCollection.getByIds(caseIds) : []
      } else if (
        currentUserId &&
        (currentRole === "individual" ||
          currentRole === "organization" ||
          currentRole === "parent" ||
          currentRole === "care_foundation")
      ) {
        data = await casesCollection.getByUser(currentUserId!)
      } else {
        data = await casesCollection.getAll()
      }
      if (!isCurrent()) return
      setProfiles(data)
    } catch (error) {
      if (!isCurrent()) return
      console.error("Failed to fetch profiles:", error)
      setLoadError(getErrorMessage(error))
      toast.error(getErrorMessage(error))
    } finally {
      if (isCurrent()) setIsLoading(false)
    }
  }, [currentUserId, currentRole, enabled, scope, beginRequest])

  useEffect(() => {
    // Fetch external records when the selected scope changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfiles()
  }, [fetchProfiles])

  const addProfile = async (data: Partial<Profile>, userId?: string) => {
    try {
      const ownerId = userId !== undefined ? userId : currentUser?.id
      const newProfile = await casesCollection.create({
        ...data,
        user: ownerId,
      })
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
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      )
      return updated
    } catch (error) {
      console.error("Failed to update profile:", error)
      throw error
    }
  }

  const setPaymentAmount = async (id: string, amount: number) => {
    try {
      const updated = await pb.send<Profile>("/api/dsc/payments/" + id, {
        method: "PATCH",
        body: {
          action: "set_amount",
          amount,
        },
      })
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      )
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
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      )
      return updated
    } catch (error) {
      console.error("Failed to submit payment slip:", error)
      throw error
    }
  }

  const approveCase = async (id: string) => {
    try {
      const updated = await pb.send<Profile>("/api/dsc/payments/" + id, {
        method: "PATCH",
        body: { action: "approve" },
      })
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      )
      return updated
    } catch (error) {
      console.error("Failed to approve case:", error)
      throw error
    }
  }

  const rejectPayment = async (id: string, reason?: string) => {
    try {
      const updated = await pb.send<Profile>("/api/dsc/payments/" + id, {
        method: "PATCH",
        body: { action: "reject", reason: reason || "" },
      })
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      )
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
    loadError,
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
