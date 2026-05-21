export type LectureStatus = "draft" | "published" | "cancelled" | "completed"

export interface BilingualString {
  en: string
  ar: string
}

export interface Lecture {
  id: string
  title: BilingualString
  description: BilingualString
  speaker: string
  speakerRole?: string
  dateTime: string
  duration: number
  location: string
  meetingLink?: string
  maxParticipants?: number
  thumbnail?: string
  status: LectureStatus
  created: string
  updated: string
}

export interface LectureRegistration {
  id: string
  lectureId: string
  userId: string
  userName: string
  email: string
  phone?: string
  registeredAt: string
  status: "registered" | "attended" | "cancelled"
}

export interface LectureAttendance {
  registrationId: string
  attended: boolean
  attendedAt?: string
  notes?: string
}

export interface LectureStats {
  totalRegistered: number
  totalAttended: number
  attendanceRate: number
  noShowCount: number
  cancellationCount: number
}

export type CreateLectureInput = Omit<Lecture, "id" | "created" | "updated">

export type UpdateLectureInput = Partial<CreateLectureInput>
