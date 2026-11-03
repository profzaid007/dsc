import type { OneToOneMeetingConfig } from "@/types/tool"

export const sessionTypes = [
  { value: "counseling", ar: "إرشادية", en: "Counseling" },
  { value: "consultation", ar: "استشارية", en: "Consultation" },
  { value: "assessment", ar: "تقييمية", en: "Assessment" },
  { value: "follow_up", ar: "متابعة", en: "Follow-up" },
  { value: "other", ar: "أخرى", en: "Other" },
] as const

export type MeetingDraft = {
  title: string; date: string; time: string; meetingType: "online" | "face_to_face"
  meetingLink: string; location: string; sessionType: string; description: string
  notes: string; notesVisibleToUser: boolean
}

export function meetingDraft(title = "", config?: Partial<OneToOneMeetingConfig>): MeetingDraft {
  return {
    title, date: config?.date || "", time: config?.time || "", meetingType: config?.meetingType || "online",
    meetingLink: config?.meetingLink || "", location: config?.location || "", sessionType: config?.sessionType || "counseling",
    description: config?.description || "", notes: config?.notes || "", notesVisibleToUser: config?.notesVisibleToUser === true,
  }
}

export function meetingConfig(draft: MeetingDraft, existing?: Partial<OneToOneMeetingConfig>): OneToOneMeetingConfig {
  return {
    ...existing,
    date: draft.date, time: draft.time, meetingType: draft.meetingType,
    meetingLink: draft.meetingType === "online" ? draft.meetingLink.trim() : "",
    location: draft.meetingType === "face_to_face" ? draft.location.trim() : "",
    sessionType: draft.sessionType, description: draft.description.trim(),
    notes: draft.notes.trim(), notesVisibleToUser: draft.notesVisibleToUser,
    media: existing?.media || [],
  }
}

export function isMeetingDraftValid(draft: MeetingDraft) {
  return Boolean(draft.title.trim() && draft.date && draft.time && draft.sessionType)
}
