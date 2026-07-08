"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  Lecture,
  LectureRegistration,
  CreateLectureInput,
  UpdateLectureInput,
  LectureStats,
} from "@/types/lecture"
import {
  lecturesCollection,
  lectureRegistrationsCollection,
} from "@/lib/pb-lectures"

export function useLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [registrations, setRegistrations] = useState<LectureRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {

      let lecturesData: Lecture[] = []
      let registrationsData: LectureRegistration[] = []

      lecturesData = await lecturesCollection.getAll()
      setLectures(lecturesData)

      registrationsData = await lectureRegistrationsCollection.getAll()
      setRegistrations(registrationsData)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lectures")
      console.error("Failed to load lectures:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Lecture CRUD operations
  const addLecture = async (data: CreateLectureInput) => {
    // Extract file from input (not part of Lecture type once saved)
    const { thumbnail, ...rest } = data
    const file = thumbnail instanceof File ? thumbnail : undefined
    const newLecture = await lecturesCollection.create(rest, file)
    setLectures((prev) => [...prev, newLecture])
    return newLecture.id
  }

  const updateLecture = async (id: string, data: UpdateLectureInput) => {
    const { thumbnail, ...rest } = data
    const file = thumbnail instanceof File ? thumbnail : undefined
    const updatedLecture = await lecturesCollection.update(id, rest, file)
    setLectures((prev) =>
      prev.map((lecture) => (lecture.id === id ? updatedLecture : lecture))
    )
  }

  const deleteLecture = async (id: string) => {
    await lecturesCollection.delete(id)
    setLectures((prev) => prev.filter((lecture) => lecture.id !== id))
    // Also remove related registrations from local state
    setRegistrations((prev) => prev.filter((reg) => reg.lectureId !== id))
  }

  const getLectureById = (id: string) => {
    return lectures.find((lecture) => lecture.id === id)
  }

  // Filter operations
  const getUpcomingLectures = useCallback(() => {
    const now = new Date().toISOString()
    return lectures
      .filter(
        (lecture) =>
          lecture.schedule.dateTime > now &&
          (lecture.status === "published" || lecture.status === "draft")
      )
      .sort(
        (a, b) =>
          new Date(a.schedule.dateTime).getTime() -
          new Date(b.schedule.dateTime).getTime()
      )
  }, [lectures])

  const getPastLectures = useCallback(() => {
    const now = new Date().toISOString()
    return lectures
      .filter(
        (lecture) =>
          lecture.schedule.dateTime <= now || lecture.status === "completed"
      )
      .sort(
        (a, b) =>
          new Date(b.schedule.dateTime).getTime() -
          new Date(a.schedule.dateTime).getTime()
      )
  }, [lectures])

  const getPublishedLectures = useCallback(() => {
    return lectures
      .filter((lecture) => lecture.status === "published")
      .sort(
        (a, b) =>
          new Date(a.schedule.dateTime).getTime() -
          new Date(b.schedule.dateTime).getTime()
      )
  }, [lectures])

  // Registration operations
  const registerForLecture = async (
    lectureId: string,
    userData: {
      userId: string
      userName: string
      email: string
      phone?: string
    }
  ) => {
    const newRegistration = await lectureRegistrationsCollection.create({
      lectureId,
      ...userData,
      email: userData.email.toLowerCase(),
      registeredAt: new Date().toISOString(),
      status: "registered",
    })

    await lecturesCollection.incrementRegistrations(lectureId, 1)

    setRegistrations((prev) => [...prev, newRegistration])
    setLectures((prev) =>
      prev.map((lecture) =>
        lecture.id === lectureId
          ? {
              ...lecture,
              currentRegistrations: lecture.currentRegistrations + 1,
            }
          : lecture
      )
    )

    return newRegistration.id
  }

  const cancelRegistration = async (registrationId: string) => {
    const registration = registrations.find((reg) => reg.id === registrationId)
    if (!registration) return

    const updated = await lectureRegistrationsCollection.update(
      registrationId,
      { status: "absent" }
    )

    await lecturesCollection.incrementRegistrations(registration.lectureId, -1)

    setRegistrations((prev) =>
      prev.map((reg) => (reg.id === registrationId ? updated : reg))
    )
    setLectures((prev) =>
      prev.map((lecture) =>
        lecture.id === registration.lectureId
          ? {
              ...lecture,
              currentRegistrations: Math.max(
                0,
                lecture.currentRegistrations - 1
              ),
            }
          : lecture
      )
    )
  }

  const getRegistrationsByLecture = (lectureId: string) => {
    return registrations.filter((reg) => reg.lectureId === lectureId)
  }

  const getUserRegistration = (lectureId: string, userId: string) => {
    return registrations.find(
      (reg) =>
        reg.lectureId === lectureId &&
        reg.userId === userId &&
        reg.status !== "absent"
    )
  }

  // Attendance operations — merged into registration status
  const markAttendance = async (
    registrationId: string,
    attended: boolean,
    notes?: string
  ) => {
    const update: Partial<LectureRegistration> = {
      status: attended ? "attended" : "registered",
    }
    if (notes !== undefined) update.notes = notes

    const updated = await lectureRegistrationsCollection.update(
      registrationId,
      update
    )

    setRegistrations((prev) =>
      prev.map((reg) => (reg.id === registrationId ? updated : reg))
    )
  }

  const getAttendanceByLecture = (lectureId: string) => {
    const lectureRegistrations = registrations.filter(
      (reg) => reg.lectureId === lectureId && reg.status !== "absent"
    )
    return lectureRegistrations.map((reg) => ({
      registration: reg,
      attended: reg.status === "attended",
    }))
  }

  // Stats
  const getLectureStats = (lectureId: string): LectureStats => {
    const lectureRegs = registrations.filter(
      (reg) => reg.lectureId === lectureId
    )
    const totalRegistered = lectureRegs.filter(
      (reg) => reg.status !== "absent"
    ).length
    const totalAttended = lectureRegs.filter(
      (reg) => reg.status === "attended"
    ).length
    const absentCount = lectureRegs.filter(
      (reg) => reg.status === "absent"
    ).length
    const noShowCount = totalRegistered - totalAttended
    const attendanceRate =
      totalRegistered > 0
        ? Math.round((totalAttended / totalRegistered) * 100)
        : 0

    return {
      totalRegistered,
      totalAttended,
      attendanceRate,
      noShowCount,
      absentCount,
    }
  }

  // Check if lecture is full
  const isLectureFull = (lectureId: string) => {
    const lecture = getLectureById(lectureId)
    if (!lecture || !lecture.maxParticipants) return false
    return lecture.currentRegistrations >= lecture.maxParticipants
  }

  // Check if user is registered
  const isUserRegistered = (lectureId: string, userId: string) => {
    return registrations.some(
      (reg) =>
        reg.lectureId === lectureId &&
        reg.userId === userId &&
        reg.status !== "absent"
    )
  }

  return {
    lectures,
    registrations,
    isLoading,
    error,
    addLecture,
    updateLecture,
    deleteLecture,
    getLectureById,
    getUpcomingLectures,
    getPastLectures,
    getPublishedLectures,
    registerForLecture,
    cancelRegistration,
    getRegistrationsByLecture,
    getUserRegistration,
    markAttendance,
    getAttendanceByLecture,
    getLectureStats,
    isLectureFull,
    isUserRegistered,
    refresh: loadData,
  }
}
