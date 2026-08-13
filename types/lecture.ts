export type LectureStatus = "draft" | "published" | "cancelled" | "completed"

export interface BilingualString {
  en: string
  ar: string
}

export interface SpeakerInfo {
  name: BilingualString
  role: BilingualString
}

export interface ScheduleInfo {
  dateTime: string
  location: string
}

export interface Lecture {
  id: string
  title: BilingualString
  description: BilingualString
  speaker: SpeakerInfo
  schedule: ScheduleInfo
  duration: number
  meetingLink?: string
  recordingUrl?: string
  currentRegistrations: number
  thumbnail?: string
  is_public: boolean
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
  notes?: string
  status: "registered" | "attended" | "absent"
}

export interface LectureStats {
  totalRegistered: number
  totalAttended: number
  attendanceRate: number
  noShowCount: number
  absentCount: number
}

export type CreateLectureInput = Omit<
  Lecture,
  "id" | "created" | "updated" | "currentRegistrations" | "thumbnail"
> & {
  thumbnail?: string | File
}

export type UpdateLectureInput = Partial<CreateLectureInput>
