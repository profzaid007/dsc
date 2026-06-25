"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CreateLectureInput } from "@/types/lecture"

interface LectureFormProps {
  initialData?: Partial<CreateLectureInput>
  onSubmit: (data: CreateLectureInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
]

const emptyForm: CreateLectureInput = {
  title: { en: "", ar: "" },
  description: { en: "", ar: "" },
  speaker: {
    name: { en: "", ar: "" },
    role: { en: "", ar: "" },
  },
  schedule: { dateTime: "", location: "" },
  duration: 60,
  meetingLink: "",
  recordingUrl: "",
  maxParticipants: undefined,
  thumbnail: "",
  status: "draft",
}

export function LectureForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Create Lecture",
}: LectureFormProps) {
  const [formData, setFormData] = useState<CreateLectureInput>(() => ({
    ...emptyForm,
    ...initialData,
    // Ensure nested objects are fully present when editing an existing lecture
    speaker: {
      ...emptyForm.speaker,
      ...initialData?.speaker,
      name: { ...emptyForm.speaker.name, ...initialData?.speaker?.name },
      role: { ...emptyForm.speaker.role, ...initialData?.speaker?.role },
    },
    schedule: {
      ...emptyForm.schedule,
      ...initialData?.schedule,
    },
    title: { ...emptyForm.title, ...initialData?.title },
    description: { ...emptyForm.description, ...initialData?.description },
  }))

  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(
    () => {
      const thumb = initialData?.thumbnail
      return typeof thumb === "string" ? thumb : undefined
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormData({ ...formData, thumbnail: file })
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const updateSpeaker = (
    field: "name" | "role",
    lang: "en" | "ar",
    value: string
  ) => {
    setFormData({
      ...formData,
      speaker: {
        ...formData.speaker,
        [field]: {
          ...formData.speaker[field],
          [lang]: value,
        },
      },
    })
  }

  const updateSchedule = (field: keyof typeof formData.schedule, value: string) => {
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, [field]: value },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titleEn">Title (English) *</Label>
              <Input
                id="titleEn"
                value={formData.title.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: { ...formData.title, en: e.target.value },
                  })
                }
                placeholder="Enter lecture title in English"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleAr">Title (Arabic) *</Label>
              <Input
                id="titleAr"
                value={formData.title.ar}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: { ...formData.title, ar: e.target.value },
                  })
                }
                placeholder="أدخل عنوان المحاضرة بالعربية"
                required
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="descEn">Description (English) *</Label>
              <Textarea
                id="descEn"
                value={formData.description.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: {
                      ...formData.description,
                      en: e.target.value,
                    },
                  })
                }
                placeholder="Enter lecture description in English"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descAr">Description (Arabic) *</Label>
              <Textarea
                id="descAr"
                value={formData.description.ar}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: {
                      ...formData.description,
                      ar: e.target.value,
                    },
                  })
                }
                placeholder="أدخل وصف المحاضرة بالعربية"
                rows={4}
                required
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Speaker Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="speakerNameEn">Speaker Name (English) *</Label>
              <Input
                id="speakerNameEn"
                value={formData.speaker.name.en}
                onChange={(e) => updateSpeaker("name", "en", e.target.value)}
                placeholder="Enter speaker name in English"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speakerNameAr">Speaker Name (Arabic) *</Label>
              <Input
                id="speakerNameAr"
                value={formData.speaker.name.ar}
                onChange={(e) => updateSpeaker("name", "ar", e.target.value)}
                placeholder="أدخل اسم المتحدث بالعربية"
                required
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="speakerRoleEn">Speaker Role/Title (English)</Label>
              <Input
                id="speakerRoleEn"
                value={formData.speaker.role.en}
                onChange={(e) => updateSpeaker("role", "en", e.target.value)}
                placeholder="e.g., Child Psychologist"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speakerRoleAr">Speaker Role/Title (Arabic)</Label>
              <Input
                id="speakerRoleAr"
                value={formData.speaker.role.ar}
                onChange={(e) => updateSpeaker("role", "ar", e.target.value)}
                placeholder="مثال: أخصائية نفسية للأطفال"
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule & Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time *</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={formData.schedule.dateTime}
                onChange={(e) => updateSchedule("dateTime", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                max={480}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 60,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.schedule.location}
                onChange={(e) => updateSchedule("location", e.target.value)}
                placeholder="e.g., Main Conference Hall"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maximum Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={1}
                value={formData.maxParticipants || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxParticipants: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link (for virtual lectures)</Label>
            <Input
              id="meetingLink"
              type="url"
              value={formData.meetingLink || ""}
              onChange={(e) =>
                setFormData({ ...formData, meetingLink: e.target.value })
              }
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordingUrl">Recording URL</Label>
            <Input
              id="recordingUrl"
              type="url"
              value={formData.recordingUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, recordingUrl: e.target.value })
              }
              placeholder="https://example.com/recording/..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thumbnail Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {thumbnailPreview && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <Input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                status: value as CreateLectureInput["status"],
              })
            }
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
