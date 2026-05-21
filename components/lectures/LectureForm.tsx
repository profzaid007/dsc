"use client"

import { useState } from "react"
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
import { MediaUpload } from "@/components/ui/media-upload"
import type { CreateLectureInput, UpdateLectureInput } from "@/types/lecture"

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

export function LectureForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Create Lecture",
}: LectureFormProps) {
  const [formData, setFormData] = useState<CreateLectureInput>({
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    speaker: "",
    speakerRole: "",
    dateTime: "",
    duration: 60,
    location: "",
    meetingLink: "",
    maxParticipants: undefined,
    thumbnail: "",
    status: "draft",
    ...initialData,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleMediaUpload = (urls: string[]) => {
    setFormData({ ...formData, thumbnail: urls[0] || "" })
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
                    description: { ...formData.description, en: e.target.value },
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
                    description: { ...formData.description, ar: e.target.value },
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
              <Label htmlFor="speaker">Speaker Name *</Label>
              <Input
                id="speaker"
                value={formData.speaker}
                onChange={(e) =>
                  setFormData({ ...formData, speaker: e.target.value })
                }
                placeholder="Enter speaker name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speakerRole">Speaker Role/Title</Label>
              <Input
                id="speakerRole"
                value={formData.speakerRole || ""}
                onChange={(e) =>
                  setFormData({ ...formData, speakerRole: e.target.value })
                }
                placeholder="e.g., Child Psychologist"
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
                value={formData.dateTime}
                onChange={(e) =>
                  setFormData({ ...formData, dateTime: e.target.value })
                }
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
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thumbnail Image</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUpload
            onUpload={handleMediaUpload}
            initialUrls={formData.thumbnail ? [formData.thumbnail] : []}
            maxFiles={1}
            acceptedTypes={["image/*"]}
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
