"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  TrainingProgram,
  AwarenessSession,
  TrainingRegistration,
  TrainingCertificate,
  CreateProgramInput,
  UpdateProgramInput,
  CreateSessionInput,
  UpdateSessionInput,
  CreateCertificateInput,
  UpdateCertificateInput,
} from "@/types/training"
import {
  trainingProgramsCollection,
  trainingSessionsCollection,
  trainingRegistrationsCollection,
  trainingCertificatesCollection,
} from "@/lib/pb-training"

export function useTraining() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [sessions, setSessions] = useState<AwarenessSession[]>([])
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([])
  const [certificates, setCertificates] = useState<TrainingCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [programsData, sessionsData, registrationsData, certificatesData] =
        await Promise.all([
          trainingProgramsCollection.getAll(),
          trainingSessionsCollection.getAll(),
          trainingRegistrationsCollection.getAll(),
          trainingCertificatesCollection.getAll(),
        ])
      setPrograms(programsData)
      setSessions(sessionsData)
      setRegistrations(registrationsData)
      setCertificates(certificatesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load training data")
      console.error("Failed to load training data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Program CRUD
  const addProgram = async (data: CreateProgramInput) => {
    const newProgram = await trainingProgramsCollection.create(data)
    setPrograms((prev) => [...prev, newProgram])
    return newProgram.id
  }

  const updateProgram = async (id: string, data: UpdateProgramInput) => {
    const updated = await trainingProgramsCollection.update(id, data)
    setPrograms((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  const deleteProgram = async (id: string) => {
    await trainingProgramsCollection.delete(id)
    setPrograms((prev) => prev.filter((p) => p.id !== id))
    setRegistrations((prev) => prev.filter((r) => r.programId !== id))
  }

  const getProgramById = (id: string) => {
    return programs.find((p) => p.id === id)
  }

  // Session CRUD
  const addSession = async (data: CreateSessionInput) => {
    const newSession = await trainingSessionsCollection.create(data)
    setSessions((prev) => [...prev, newSession])
    return newSession.id
  }

  const updateSession = async (id: string, data: UpdateSessionInput) => {
    const updated = await trainingSessionsCollection.update(id, data)
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }

  const deleteSession = async (id: string) => {
    await trainingSessionsCollection.delete(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setRegistrations((prev) => prev.filter((r) => r.awarenessId !== id))
  }

  const getSessionById = (id: string) => {
    return sessions.find((s) => s.id === id)
  }

  // Filter: Programs
  const getPublishedPrograms = useCallback(() => {
    return programs
      .filter((p) => p.status === "published" || p.status === "in_progress")
      .sort(
        (a, b) =>
          new Date(a.schedule.startDate).getTime() -
          new Date(b.schedule.startDate).getTime()
      )
  }, [programs])

  const getUpcomingPrograms = useCallback(() => {
    const now = new Date()
    return programs
      .filter(
        (p) =>
          new Date(p.schedule.startDate) > now &&
          (p.status === "published" || p.status === "in_progress")
      )
      .sort(
        (a, b) =>
          new Date(a.schedule.startDate).getTime() -
          new Date(b.schedule.startDate).getTime()
      )
  }, [programs])

  const getPastPrograms = useCallback(() => {
    const now = new Date()
    return programs
      .filter(
        (p) =>
          new Date(p.schedule.endDate) < now || p.status === "completed"
      )
      .sort(
        (a, b) =>
          new Date(b.schedule.endDate).getTime() -
          new Date(a.schedule.endDate).getTime()
      )
  }, [programs])

  // Filter: Sessions
  const getPublishedSessions = useCallback(() => {
    return sessions
      .filter((s) => s.status === "published")
      .sort(
        (a, b) =>
          new Date(a.schedule.date).getTime() -
          new Date(b.schedule.date).getTime()
      )
  }, [sessions])

  const getUpcomingSessions = useCallback(() => {
    const now = new Date().toISOString().split("T")[0]
    return sessions
      .filter((s) => s.schedule.date > now && s.status === "published")
      .sort(
        (a, b) =>
          new Date(a.schedule.date).getTime() -
          new Date(b.schedule.date).getTime()
      )
  }, [sessions])

  const getPastSessions = useCallback(() => {
    const now = new Date().toISOString().split("T")[0]
    return sessions
      .filter((s) => s.schedule.date <= now || s.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.schedule.date).getTime() -
          new Date(a.schedule.date).getTime()
      )
  }, [sessions])

  // Registration
  const registerForProgram = async (
    programId: string,
    userData: {
      userId: string
      userName: string
      email: string
      phone?: string
    }
  ) => {
    const newRegistration = await trainingRegistrationsCollection.create({
      programId,
      ...userData,
      registeredAt: new Date().toISOString(),
      status: "registered",
    })
    setRegistrations((prev) => [...prev, newRegistration])
    await trainingProgramsCollection.incrementRegistrations(programId, 1)
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === programId
          ? { ...p, currentRegistrations: p.currentRegistrations + 1 }
          : p
      )
    )
    return newRegistration.id
  }

  const registerForSession = async (
    awarenessId: string,
    userData: {
      userId: string
      userName: string
      email: string
      phone?: string
    }
  ) => {
    const newRegistration = await trainingRegistrationsCollection.create({
      awarenessId,
      ...userData,
      registeredAt: new Date().toISOString(),
      status: "registered",
    })
    setRegistrations((prev) => [...prev, newRegistration])
    await trainingSessionsCollection.incrementRegistrations(awarenessId, 1)
    setSessions((prev) =>
      prev.map((s) =>
        s.id === awarenessId
          ? { ...s, currentRegistrations: s.currentRegistrations + 1 }
          : s
      )
    )
    return newRegistration.id
  }

  const cancelRegistration = async (registrationId: string) => {
    const registration = registrations.find((r) => r.id === registrationId)
    if (!registration) return

    const updated = await trainingRegistrationsCollection.update(registrationId, {
      status: "cancelled",
    })

    if (registration.programId) {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === registration.programId
            ? {
                ...p,
                currentRegistrations: Math.max(0, p.currentRegistrations - 1),
              }
            : p
        )
      )
    }
    if (registration.awarenessId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === registration.awarenessId
            ? {
                ...s,
                currentRegistrations: Math.max(0, s.currentRegistrations - 1),
              }
            : s
        )
      )
    }

    setRegistrations((prev) =>
      prev.map((r) => (r.id === registrationId ? updated : r))
    )
  }

  const updateRegistrationStatus = async (
    registrationId: string,
    status: TrainingRegistration["status"]
  ) => {
    const updated = await trainingRegistrationsCollection.update(registrationId, { status } as unknown as Partial<TrainingRegistration>)
    setRegistrations((prev) =>
      prev.map((r) => (r.id === registrationId ? updated : r))
    )
    return updated
  }

  const deleteRegistration = async (registrationId: string) => {
    const registration = registrations.find((r) => r.id === registrationId)
    if (!registration) return

    await trainingRegistrationsCollection.delete(registrationId)

    if (registration.programId && registration.status !== "cancelled") {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === registration.programId
            ? {
                ...p,
                currentRegistrations: Math.max(0, p.currentRegistrations - 1),
              }
            : p
        )
      )
    }
    if (registration.awarenessId && registration.status !== "cancelled") {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === registration.awarenessId
            ? {
                ...s,
                currentRegistrations: Math.max(0, s.currentRegistrations - 1),
              }
            : s
        )
      )
    }

    setRegistrations((prev) => prev.filter((r) => r.id !== registrationId))
  }

  const getUserProgramRegistration = (programId: string, userId: string) => {
    return registrations.find(
      (r) =>
        r.programId === programId &&
        r.userId === userId &&
        r.status !== "cancelled"
    )
  }

  const getUserSessionRegistration = (awarenessId: string, userId: string) => {
    return registrations.find(
      (r) =>
        r.awarenessId === awarenessId &&
        r.userId === userId &&
        r.status !== "cancelled"
    )
  }

  const getRegistrationsByProgram = (programId: string) => {
    return registrations.filter((r) => r.programId === programId)
  }

  const getRegistrationsBySession = (awarenessId: string) => {
    return registrations.filter((r) => r.awarenessId === awarenessId)
  }

  const getUserRegistrations = (userId: string) => {
    return registrations.filter((r) => r.userId === userId && r.status !== "cancelled")
  }

  // Certificates
  const getUserCertificates = (userId: string) => {
    return certificates.filter((c) => c.userId === userId)
  }

  const getCertificateById = (id: string) => {
    return certificates.find((c) => c.id === id)
  }

  const addCertificate = async (
    data: CreateCertificateInput,
    file?: File
  ) => {
    const newCertificate = await trainingCertificatesCollection.create(data, file)
    setCertificates((prev) => [...prev, newCertificate])
    return newCertificate.id
  }

  const updateCertificate = async (
    id: string,
    data: UpdateCertificateInput,
    file?: File
  ) => {
    const updated = await trainingCertificatesCollection.update(id, data, file)
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    )
    return updated
  }

  const deleteCertificate = async (id: string) => {
    await trainingCertificatesCollection.delete(id)
    setCertificates((prev) => prev.filter((c) => c.id !== id))
  }

  // Stats
  const getProgramStats = (programId: string) => {
    const programRegs = registrations.filter(
      (r) => r.programId === programId && r.status !== "cancelled"
    )
    const totalRegistered = programRegs.length
    const totalCompleted = programRegs.filter(
      (r) => r.status === "completed" || r.status === "attended"
    ).length
    const attendanceRate =
      totalRegistered > 0
        ? Math.round((totalCompleted / totalRegistered) * 100)
        : 0

    return {
      totalRegistered,
      totalCompleted,
      attendanceRate,
    }
  }

  const getSessionStats = (awarenessId: string) => {
    const sessionRegs = registrations.filter(
      (r) => r.awarenessId === awarenessId && r.status !== "cancelled"
    )
    const totalRegistered = sessionRegs.length
    const totalCompleted = sessionRegs.filter(
      (r) => r.status === "completed" || r.status === "attended"
    ).length
    const attendanceRate =
      totalRegistered > 0
        ? Math.round((totalCompleted / totalRegistered) * 100)
        : 0

    return {
      totalRegistered,
      totalCompleted,
      attendanceRate,
    }
  }

  // Helpers
  const isProgramFull = (programId: string) => {
    const program = getProgramById(programId)
    if (!program || !program.maxParticipants) return false
    return program.currentRegistrations >= program.maxParticipants
  }

  const isSessionFull = (awarenessId: string) => {
    const session = getSessionById(awarenessId)
    if (!session || !session.maxParticipants) return false
    return session.currentRegistrations >= session.maxParticipants
  }

  const isProgramPast = (programId: string) => {
    const program = getProgramById(programId)
    if (!program) return false
    return new Date(program.schedule.endDate) < new Date()
  }

  const isSessionPast = (awarenessId: string) => {
    const session = getSessionById(awarenessId)
    if (!session) return false
    return new Date(session.schedule.date) < new Date()
  }

  return {
    programs,
    sessions,
    registrations,
    certificates,
    isLoading,
    error,
    addProgram,
    updateProgram,
    deleteProgram,
    getProgramById,
    getPublishedPrograms,
    getUpcomingPrograms,
    getPastPrograms,
    addSession,
    updateSession,
    deleteSession,
    getSessionById,
    getPublishedSessions,
    getUpcomingSessions,
    getPastSessions,
    registerForProgram,
    registerForSession,
    cancelRegistration,
    updateRegistrationStatus,
    deleteRegistration,
    getUserProgramRegistration,
    getUserSessionRegistration,
    getRegistrationsByProgram,
    getRegistrationsBySession,
    getUserRegistrations,
    getUserCertificates,
    getCertificateById,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    getProgramStats,
    getSessionStats,
    isProgramFull,
    isSessionFull,
    isProgramPast,
    isSessionPast,
    refresh: loadData,
  }
}
