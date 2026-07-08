export interface BilingualString {
  en: string
  ar: string
}

export type ProgramStatus =
  | "draft"
  | "published"
  | "in_progress"
  | "completed"
  | "cancelled"

export type ProgramType = "online" | "in_person" | "hybrid"

export type RegistrationStatus =
  | "registered"
  | "attended"
  | "completed"
  | "cancelled"

export interface TrainerInfo {
  name: BilingualString
  role: BilingualString
}

export interface SessionSchedule {
  date: string
  timeFrom: string
  timeTo: string
  location: string
}

export interface ProgramSchedule {
  startDate: string
  endDate: string
  sessions: SessionSchedule[]
}

export interface TrainingProgram {
  id: string
  title: BilingualString
  category: BilingualString
  trainer: TrainerInfo
  coordinator: string
  type: ProgramType
  location: string
  duration: number
  goals?: BilingualString
  notes?: string
  schedule: ProgramSchedule
  maxParticipants?: number
  currentRegistrations: number
  thumbnail?: string
  meetingLink?: string
  recordingUrl?: string
  isPublic: boolean
  status: ProgramStatus
  created: string
  updated: string
}

export interface TrainingRegistration {
  id: string
  programId?: string
  lectureId?: string
  userId: string
  userName: string
  email: string
  phone?: string
  registeredAt: string
  status: RegistrationStatus
  certificateId?: string
}

export interface TrainingCertificate {
  id: string
  userId: string
  programId?: string
  userName: string
  programName: BilingualString
  issueDate: string
  certificateNumber: string
  notes?: string
  file?: string
}

export interface TrainingStats {
  totalTrained: number
  programsCompleted: number
  certificatesIssued: number
  attendanceRate: number
}

export interface ProgramStats {
  totalRegistered: number
  totalCompleted: number
  attendanceRate: number
}

export type CreateProgramInput = Omit<
  TrainingProgram,
  "id" | "created" | "updated" | "currentRegistrations" | "thumbnail"
> & { thumbnail?: string | File }

export type UpdateProgramInput = Partial<CreateProgramInput>

export type CreateRegistrationInput = Omit<
  TrainingRegistration,
  "id" | "certificateId"
>

export type UpdateRegistrationInput = Partial<CreateRegistrationInput>

export type CreateCertificateInput = Omit<
  TrainingCertificate,
  "id" | "file"
> & { file?: string | File }

export type UpdateCertificateInput = Partial<CreateCertificateInput>
