"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  Lecture,
  LectureRegistration,
  LectureAttendance,
  CreateLectureInput,
  UpdateLectureInput,
  LectureStats,
} from "@/types/lecture"
import {
  mockLectures,
  mockRegistrations,
  mockAttendance,
} from "@/lib/mock-lectures"

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [registrations, setRegistrations] = useState<LectureRegistration[]>([])
  const [attendance, setAttendance] = useState<LectureAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize with mock data
  useEffect(() => {
    const loadData = async () => {
      await delay(300) // Simulate network delay
      setLectures(mockLectures)
      setRegistrations(mockRegistrations)
      setAttendance(mockAttendance)
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Lecture CRUD operations
  const addLecture = async (data: CreateLectureInput) => {
    await delay(500)
    const newLecture: Lecture = {
      ...data,
      id: `lecture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
    setLectures((prev) => [...prev, newLecture])
    return newLecture.id
  }

  const updateLecture = async (id: string, data: UpdateLectureInput) => {
    await delay(500)
    setLectures((prev) =>
      prev.map((lecture) =>
        lecture.id === id
          ? { ...lecture, ...data, updated: new Date().toISOString() }
          : lecture
      )
    )
  }

  const deleteLecture = async (id: string) => {
    await delay(300)
    setLectures((prev) => prev.filter((lecture) => lecture.id !== id))
    // Also delete related registrations
    setRegistrations((prev) =>
      prev.filter((reg) => reg.lectureId !== id)
    )
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
          lecture.dateTime > now &&
          (lecture.status === "published" || lecture.status === "draft")
      )
      .sort((a, b) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      )
  }, [lectures])

  const getPastLectures = useCallback(() => {
    const now = new Date().toISOString()
    return lectures
      .filter(
        (lecture) =>
          lecture.dateTime <= now || lecture.status === "completed"
      )
      .sort((a, b) =>
        new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      )
  }, [lectures])

  const getPublishedLectures = useCallback(() => {
    return lectures
      .filter((lecture) => lecture.status === "published")
      .sort((a, b) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
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
    await delay(500)
    const newRegistration: LectureRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lectureId,
      ...userData,
      registeredAt: new Date().toISOString(),
      status: "registered",
    }
    setRegistrations((prev) => [...prev, newRegistration])
    return newRegistration.id
  }

  const cancelRegistration = async (registrationId: string) => {
    await delay(300)
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === registrationId ? { ...reg, status: "cancelled" } : reg
      )
    )
  }

  const getRegistrationsByLecture = (lectureId: string) => {
    return registrations.filter((reg) => reg.lectureId === lectureId)
  }

  const getUserRegistration = (lectureId: string, userId: string) => {
    return registrations.find(
      (reg) => reg.lectureId === lectureId && reg.userId === userId
    )
  }

  // Attendance operations
  const markAttendance = async (
    registrationId: string,
    attended: boolean,
    notes?: string
  ) => {
    await delay(300)
    const attendanceRecord: LectureAttendance = {
      registrationId,
      attended,
      attendedAt: attended ? new Date().toISOString() : undefined,
      notes,
    }
    setAttendance((prev) => {
      const filtered = prev.filter(
        (att) => att.registrationId !== registrationId
      )
      return [...filtered, attendanceRecord]
    })

    // Update registration status
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === registrationId
          ? { ...reg, status: attended ? "attended" : "registered" }
          : reg
      )
    )
  }

  const getAttendanceByRegistration = (registrationId: string) => {
    return attendance.find((att) => att.registrationId === registrationId)
  }

  const getAttendanceByLecture = (lectureId: string) => {
    const lectureRegistrations = registrations.filter(
      (reg) => reg.lectureId === lectureId
    )
    return lectureRegistrations.map((reg) => ({
      registration: reg,
      attendance: attendance.find((att) => att.registrationId === reg.id),
    }))
  }

  // Stats
  const getLectureStats = (lectureId: string): LectureStats => {
    const lectureRegs = registrations.filter(
      (reg) => reg.lectureId === lectureId
    )
    const totalRegistered = lectureRegs.filter(
      (reg) => reg.status !== "cancelled"
    ).length
    const totalAttended = lectureRegs.filter(
      (reg) => reg.status === "attended"
    ).length
    const cancellationCount = lectureRegs.filter(
      (reg) => reg.status === "cancelled"
    ).length
    const noShowCount = totalRegistered - totalAttended
    const attendanceRate =
      totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0

    return {
      totalRegistered,
      totalAttended,
      attendanceRate,
      noShowCount,
      cancellationCount,
    }
  }

  // Check if lecture is full
  const isLectureFull = (lectureId: string) => {
    const lecture = getLectureById(lectureId)
    if (!lecture || !lecture.maxParticipants) return false

    const registeredCount = registrations.filter(
      (reg) =>
        reg.lectureId === lectureId &&
        (reg.status === "registered" || reg.status === "attended")
    ).length

    return registeredCount >= lecture.maxParticipants
  }

  // Check if user is registered
  const isUserRegistered = (lectureId: string, userId: string) => {
    return registrations.some(
      (reg) =>
        reg.lectureId === lectureId &&
        reg.userId === userId &&
        reg.status !== "cancelled"
    )
  }

  return {
    lectures,
    registrations,
    attendance,
    isLoading,
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
    getAttendanceByRegistration,
    getAttendanceByLecture,
    getLectureStats,
    isLectureFull,
    isUserRegistered,
    refresh: () => {}, // Placeholder for future real API
  }
}
