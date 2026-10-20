import { boundedFullList } from "@/lib/bounded-records"
import pb from "./pb"
import type {
  TrainingProgram,
  TrainingRegistration,
  TrainingCertificate,
  CreateProgramInput,
  UpdateProgramInput,
  CreateRegistrationInput,
  CreateCertificateInput,
  UpdateCertificateInput,
  TrainerInfo,
  ProgramSchedule,
} from "@/types/training"

const PROGRAMS_COLLECTION = "programs"
const CERTIFICATES_COLLECTION = "event_certificates"

// ---------------------------------------------------------------------------
// Thumbnail URL helper
// ---------------------------------------------------------------------------

function getThumbnailUrl(record: Record<string, unknown>): string | undefined {
  const thumbnail = record.thumbnail
  if (!thumbnail) return undefined
  if (typeof thumbnail === "string")
    return pb.files.getUrl(record as never, thumbnail)
  if (Array.isArray(thumbnail) && thumbnail.length > 0) {
    return pb.files.getUrl(record as never, thumbnail[0] as string)
  }
  return undefined
}

function getFileUrl(
  record: Record<string, unknown>,
  fieldName: string
): string | undefined {
  const file = record[fieldName]
  if (!file) return undefined
  if (Array.isArray(file) && file.length > 0) {
    return pb.files.getUrl(record as never, file[0] as string)
  }
  if (typeof file === "string") {
    return pb.files.getUrl(record as never, file)
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Programs transformers
// ---------------------------------------------------------------------------

export function programFromDB(
  record: Record<string, unknown>
): TrainingProgram {
  return {
    id: record.id as string,
    main_category: (record.main_category as string) || "",
    subcategory: (record.subcategory as string) || "",
    keywords:
      record.keywords !== undefined
        ? String(record.keywords || "")
        : String(record.subcategory || ""),
    title: record.name as TrainingProgram["title"],
    category: record.category as TrainingProgram["category"],
    trainer: record.trainer_name as TrainerInfo,
    coordinator:
      typeof record.coordinator === "string"
        ? record.coordinator
        : (record.coordinator as Record<string, string>)?.en || "",
    type: record.type as TrainingProgram["type"],
    location:
      typeof record.location === "string"
        ? record.location
        : (record.location as Record<string, string>)?.en || "",
    duration: record.duration as number,
    goals: record.goals as TrainingProgram["goals"],
    notes:
      typeof record.notes === "string"
        ? record.notes
        : (record.notes as Record<string, string>)?.en || undefined,
    schedule:
      typeof record.schedule === "string"
        ? JSON.parse(record.schedule)
        : (record.schedule as ProgramSchedule),
    maxParticipants: (record.max_participants as number) || undefined,
    currentRegistrations: (record.current_registrations as number) || 0,
    thumbnail: getThumbnailUrl(record),
    meetingLink: (record.meeting_link as string) || undefined,
    recordingUrl: (record.recording_url as string) || undefined,
    isPublic: record.is_public === true,
    status: record.status as TrainingProgram["status"],
    created: record.created as string,
    updated: record.updated as string,
  }
}

function programToDB(
  data: Partial<CreateProgramInput | UpdateProgramInput>
): Record<string, unknown> {
  const dbData: Record<string, unknown> = {}

  if (data.keywords !== undefined) {
    dbData.keywords = data.keywords
    dbData.subcategory = ""
  }
  if (data.main_category !== undefined)
    dbData.main_category = data.main_category
  if (data.keywords === undefined && data.subcategory !== undefined)
    dbData.subcategory = data.subcategory
  if (data.title !== undefined) dbData.name = data.title
  if (data.category !== undefined) dbData.category = data.category
  if (data.trainer !== undefined) dbData.trainer_name = data.trainer
  if (data.coordinator !== undefined) dbData.coordinator = data.coordinator
  if (data.type !== undefined) dbData.type = data.type
  if (data.location !== undefined) dbData.location = data.location
  if (data.duration !== undefined) dbData.duration = data.duration
  if (data.goals !== undefined) dbData.goals = data.goals
  if (data.notes !== undefined) dbData.notes = data.notes
  if (data.schedule !== undefined) dbData.schedule = data.schedule
  if (data.maxParticipants !== undefined)
    dbData.max_participants = data.maxParticipants
  if (data.meetingLink !== undefined) dbData.meeting_link = data.meetingLink
  if (data.recordingUrl !== undefined) dbData.recording_url = data.recordingUrl
  if (data.isPublic !== undefined) dbData.is_public = data.isPublic
  if (data.status !== undefined) dbData.status = data.status

  return dbData
}

function buildProgramFormData(
  data: Partial<CreateProgramInput | UpdateProgramInput>,
  file?: File
): FormData {
  const formData = new FormData()
  const dbData = programToDB(data)

  Object.entries(dbData).forEach(([key, value]) => {
    if (value === undefined) return
    if (typeof value === "string") {
      formData.append(key, value)
    } else {
      formData.append(key, JSON.stringify(value))
    }
  })

  if (file) {
    formData.append("thumbnail", file)
  }

  return formData
}

// ---------------------------------------------------------------------------
// Registrations transformers
// ---------------------------------------------------------------------------

export function registrationFromDB(
  record: Record<string, unknown>
): TrainingRegistration {
  const details = (record.user_details || {}) as Record<string, string>
  return {
    id: String(record.id),
    programId: String(record.program_id || ""),
    userId: String(record.user || ""),
    userName: details.name || "",
    email: details.email || "",
    phone: details.contact || "",
    registeredAt: String(record.created || ""),
    status: (record.program_status === "enrolled"
      ? "registered"
      : record.program_status ||
        "registered") as TrainingRegistration["status"],
  }
}
// ---------------------------------------------------------------------------
// Certificates transformers
// ---------------------------------------------------------------------------

export function certificateFromDB(
  record: Record<string, unknown>
): TrainingCertificate {
  return {
    id: record.id as string,
    userId: (record.user_id as string) || "",
    programId: (record.program_id as string) || undefined,
    userName: (record.name as string) || "",
    programName:
      (record.program_name as TrainingCertificate["programName"]) || {
        en: "",
        ar: "",
      },
    issueDate: (record.issue_date as string) || "",
    certificateNumber: String(
      record.certificate_no || record.certificate_number || ""
    ),
    notes: (record.notes as string) || undefined,
    file: getFileUrl(record, "file"),
  }
}

function certificateToDB(
  data: Partial<CreateCertificateInput | UpdateCertificateInput>
): Record<string, unknown> {
  const dbData: Record<string, unknown> = {}

  if (data.userId !== undefined) dbData.user_id = data.userId
  if (data.programId !== undefined) dbData.program_id = data.programId
  if (data.userName !== undefined) dbData.name = data.userName
  if (data.programName !== undefined) dbData.program_name = data.programName
  if (data.issueDate !== undefined) dbData.issue_date = data.issueDate
  if (data.certificateNumber !== undefined)
    dbData.certificate_no = data.certificateNumber
  if (data.notes !== undefined) dbData.notes = data.notes

  return dbData
}

function buildCertificateFormData(
  data: Partial<CreateCertificateInput | UpdateCertificateInput>,
  file?: File
): FormData {
  const formData = new FormData()
  const dbData = certificateToDB(data)
  for (const [key, value] of Object.entries(dbData)) {
    if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value))
    } else if (value !== undefined) {
      formData.append(key, String(value))
    }
  }
  if (file) formData.append("file", file)
  return formData
}

// ---------------------------------------------------------------------------
// Programs collection
// ---------------------------------------------------------------------------

export const trainingProgramsCollection = {
  async getAll(): Promise<TrainingProgram[]> {
    const data = await boundedFullList(pb.collection(PROGRAMS_COLLECTION), {
      sort: "-created",
    })
    return data.map((item) =>
      programFromDB(item as unknown as Record<string, unknown>)
    )
  },

  async getPublished(): Promise<TrainingProgram[]> {
    const data = await boundedFullList(pb.collection(PROGRAMS_COLLECTION), {
      filter: 'status = "published" || status = "in_progress"',
      sort: "schedule.startDate",
    })
    return data.map((item) =>
      programFromDB(item as unknown as Record<string, unknown>)
    )
  },

  /**
   * Every programme a public visitor is allowed to see, including finished
   * ones. Deliberately separate from getPublished(), which hides completed
   * programmes and is still what the /programmes/training_programmes list
   * page uses.
   */
  async getPubliclyVisible(): Promise<TrainingProgram[]> {
    const data = await boundedFullList(pb.collection(PROGRAMS_COLLECTION), {
      filter:
        'status = "published" || status = "in_progress" || status = "completed"',
      sort: "schedule.startDate",
    })
    return data.map((item) =>
      programFromDB(item as unknown as Record<string, unknown>)
    )
  },

  async getById(id: string): Promise<TrainingProgram> {
    const data = await pb.collection(PROGRAMS_COLLECTION).getOne(id)
    return programFromDB(data as unknown as Record<string, unknown>)
  },

  async create(
    data: CreateProgramInput,
    file?: File
  ): Promise<TrainingProgram> {
    const result = file
      ? await pb
          .collection(PROGRAMS_COLLECTION)
          .create(buildProgramFormData(data, file))
      : await pb.collection(PROGRAMS_COLLECTION).create(programToDB(data))
    return programFromDB(result as unknown as Record<string, unknown>)
  },

  async update(
    id: string,
    data: UpdateProgramInput,
    file?: File
  ): Promise<TrainingProgram> {
    const result = file
      ? await pb
          .collection(PROGRAMS_COLLECTION)
          .update(id, buildProgramFormData(data, file))
      : await pb.collection(PROGRAMS_COLLECTION).update(id, programToDB(data))
    return programFromDB(result as unknown as Record<string, unknown>)
  },

  async delete(id: string): Promise<void> {
    await pb.collection(PROGRAMS_COLLECTION).delete(id)
  },
}

// ---------------------------------------------------------------------------
// Registrations collection
// ---------------------------------------------------------------------------

async function loadRegistrations(
  filters: Record<string, string> = {}
): Promise<TrainingRegistration[]> {
  const rows: TrainingRegistration[] = []
  for (let page = 1; page <= 50; page++) {
    const query = new URLSearchParams({ ...filters, page: String(page) })
    const result = await pb.send<{ items: Record<string, unknown>[] }>(
      "/api/dsc/training-registrations?" + query,
      { method: "GET", requestKey: null }
    )
    rows.push(...result.items.map(registrationFromDB))
    if (result.items.length < 200) return rows
  }
  throw new Error("Too many enrollments; narrow the search")
}
export const trainingRegistrationsCollection = {
  getAll: () => loadRegistrations(),
  getByProgram: (programId: string) =>
    loadRegistrations({ program_id: programId }),
  getByUser: (userId: string) => loadRegistrations({ user: userId }),
  async getUserProgramRegistration(programId: string, userId: string) {
    return (
      await loadRegistrations({ program_id: programId, user: userId })
    ).find((r) => r.status !== "cancelled")
  },
  async create(data: CreateRegistrationInput): Promise<TrainingRegistration> {
    if (data.userId !== pb.authStore.record?.id)
      throw new Error("Enroll using the client's account")
    return registrationFromDB(
      await pb.send(`/api/dsc/programs/${data.programId}/enroll`, {
        method: "POST",
      })
    )
  },
  async update(
    id: string,
    data: Partial<TrainingRegistration>
  ): Promise<TrainingRegistration> {
    return registrationFromDB(
      await pb.send(`/api/dsc/training-registrations/${id}`, {
        method: "PATCH",
        body: { status: data.status },
      })
    )
  },
  async delete(id: string): Promise<void> {
    await pb.send(`/api/dsc/training-registrations/${id}`, { method: "DELETE" })
  },
}

// ---------------------------------------------------------------------------
// Certificates collection
// ---------------------------------------------------------------------------

export const trainingCertificatesCollection = {
  async getAll(): Promise<TrainingCertificate[]> {
    const data = await boundedFullList(pb.collection(CERTIFICATES_COLLECTION), {
      sort: "-created",
    })
    return data.map((item) =>
      certificateFromDB(item as unknown as Record<string, unknown>)
    )
  },

  async getByUser(userId: string): Promise<TrainingCertificate[]> {
    const data = await boundedFullList(pb.collection(CERTIFICATES_COLLECTION), {
      filter: pb.filter("user = {:value0}", { value0: userId }),
      sort: "-created",
    })
    return data.map((item) =>
      certificateFromDB(item as unknown as Record<string, unknown>)
    )
  },

  async getByProgram(programId: string): Promise<TrainingCertificate[]> {
    const data = await boundedFullList(pb.collection(CERTIFICATES_COLLECTION), {
      filter: pb.filter("program_id = {:value0}", { value0: programId }),
      sort: "-created",
    })
    return data.map((item) =>
      certificateFromDB(item as unknown as Record<string, unknown>)
    )
  },

  async getById(id: string): Promise<TrainingCertificate | undefined> {
    try {
      const data = await pb.collection(CERTIFICATES_COLLECTION).getOne(id)
      return certificateFromDB(data as unknown as Record<string, unknown>)
    } catch {
      return undefined
    }
  },

  async create(
    data: CreateCertificateInput,
    file?: File
  ): Promise<TrainingCertificate> {
    const formData = buildCertificateFormData(data, file)
    const result = await pb.collection(CERTIFICATES_COLLECTION).create(formData)
    return certificateFromDB(result as unknown as Record<string, unknown>)
  },

  async update(
    id: string,
    data: UpdateCertificateInput,
    file?: File
  ): Promise<TrainingCertificate> {
    const formData = buildCertificateFormData(data, file)
    const result = await pb
      .collection(CERTIFICATES_COLLECTION)
      .update(id, formData)
    return certificateFromDB(result as unknown as Record<string, unknown>)
  },

  async delete(id: string): Promise<void> {
    await pb.collection(CERTIFICATES_COLLECTION).delete(id)
  },
}
