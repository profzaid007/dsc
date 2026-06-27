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
  TrainingStats,
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
    setRegistrations((prev) => prev.filter((r) => r.sessionId !== id))
  }

  const getSessionById = (id: string) => {
    return sessions.find((s) => s.id === id)
  }

  // Filter: Programs
  const getPublishedPrograms = useCallback(() => {
    return programs
      .filter((p) => p.status === "published" || p.status === "in_progress")
      .sort((a, b) => new Date(a.schedule.startDate).getTime() - new Date(b.schedule.startDate).getTime())
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
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
  }, [sessions])

  const getUpcomingSessions = useCallback(() => {
    const now = new Date().toISOString().split("T")[0]
    return sessions
      .filter((s) => s.date > now && s.status === "published")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [sessions])

  const getPastSessions = useCallback(() => {
    const now = new Date().toISOString().split("T")[0]
    return sessions
      .filter((s) => s.date <= now || s.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
    sessionId: string,
    userData: {
      userId: string
      userName: string
      email: string
      phone?: string
    }
  ) => {
    const newRegistration = await trainingRegistrationsCollection.create({
      sessionId,
      ...userData,
      registeredAt: new Date().toISOString(),
      status: "registered",
    })
    setRegistrations((prev) => [...prev, newRegistration])
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
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
    if (registration.sessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === registration.sessionId
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

  const getUserProgramRegistration = (programId: string, userId: string) => {
    return registrations.find(
      (r) =>
        r.programId === programId &&
        r.userId === userId &&
        r.status !== "cancelled"
    )
  }

  const getUserSessionRegistration = (sessionId: string, userId: string) => {
    return registrations.find(
      (r) =>
        r.sessionId === sessionId &&
        r.userId === userId &&
        r.status !== "cancelled"
    )
  }

  const getRegistrationsByProgram = (programId: string) => {
    return registrations.filter((r) => r.programId === programId)
  }

  const getRegistrationsBySession = (sessionId: string) => {
    return registrations.filter((r) => r.sessionId === sessionId)
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

  const getSessionStats = (sessionId: string) => {
    const sessionRegs = registrations.filter(
      (r) => r.sessionId === sessionId && r.status !== "cancelled"
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

  const isSessionFull = (sessionId: string) => {
    const session = getSessionById(sessionId)
    if (!session || !session.maxParticipants) return false
    return session.currentRegistrations >= session.maxParticipants
  }

  const isProgramPast = (programId: string) => {
    const program = getProgramById(programId)
    if (!program) return false
    return new Date(program.schedule.endDate) < new Date()
  }

  const isSessionPast = (sessionId: string) => {
    const session = getSessionById(sessionId)
    if (!session) return false
    return new Date(session.date) < new Date()
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
    getUserProgramRegistration,
    getUserSessionRegistration,
    getRegistrationsByProgram,
    getRegistrationsBySession,
    getUserRegistrations,
    getUserCertificates,
    getCertificateById,
    getProgramStats,
    getSessionStats,
    isProgramFull,
    isSessionFull,
    isProgramPast,
    isSessionPast,
    refresh: loadData,
  }
}
