"use client"
import { useUiTranslation } from "@/hooks/useUiTranslation"

import { EventImageField } from "@/components/form/EventImageField"
import { ClassificationFields } from "@/components/form/ClassificationFields"
import { useLang } from "@/lib/lang-context"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
  keywords: "",
  title: { en: "", ar: "" },
  description: { en: "", ar: "" },
  speaker: {
    name: { en: "", ar: "" },
    role: { en: "", ar: "" },
  },
  schedule: { dateTime: "", location: "" },
  is_public: false,
  duration: 60,
  meetingLink: "",
  recordingUrl: "",
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
  const { lang } = useLang()
  const ui = useUiTranslation()

  const [formData, setFormData] = useState<CreateLectureInput>(() => ({
    ...emptyForm,
    ...initialData,
    keywords: initialData?.keywords ?? initialData?.subcategory ?? "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({...formData, schedule:{...formData.schedule, mode:formData.schedule.mode || "in_person"}})
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
    <form onSubmit={handleSubmit} className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Card>
        <CardHeader>
          <CardTitle>{ui("Basic Information")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClassificationFields required={!initialData} main={formData.main_category || ""} keywords={formData.keywords || ""} disabled={isSubmitting}
            onChange={(main, keywords) => setFormData({ ...formData, main_category: main, keywords, subcategory: "" })} />
          <div className="dsc-form-grid">
            <div className="space-y-2">
              <Label htmlFor="titleEn">{ui("Title (English) *")}</Label>
              <Input
                id="titleEn"
                dir="ltr"
                value={formData.title.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: { ...formData.title, en: e.target.value },
                  })
                }
                placeholder={ui("Enter lecture title in English")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleAr">{ui("Title (Arabic) *")}</Label>
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

          <div className="dsc-form-grid">
            <div className="space-y-2">
              <Label htmlFor="descEn">{ui("Description (English) *")}</Label>
              <Textarea
                id="descEn"
                dir="ltr"
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
                placeholder={ui("Enter lecture description in English")}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descAr">{ui("Description (Arabic) *")}</Label>
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

      <EventImageField value={formData.thumbnail} disabled={isSubmitting}
        onChange={file => setFormData(previous => ({...previous, thumbnail:file}))} />

      <Card>
        <CardHeader>
          <CardTitle>{ui("Speaker Information")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="dsc-form-grid">
            <div className="space-y-2">
              <Label htmlFor="speakerNameEn">{ui("Speaker Name (English) *")}</Label>
              <Input
                id="speakerNameEn"
                dir="ltr"
                value={formData.speaker.name.en}
                onChange={(e) => updateSpeaker("name", "en", e.target.value)}
                placeholder={ui("Enter speaker name in English")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speakerNameAr">{ui("Speaker Name (Arabic) *")}</Label>
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

          <div className="dsc-form-grid">
            <div className="space-y-2">
              <Label htmlFor="speakerRoleEn">{ui("Speaker Role/Title (English)")}</Label>
              <Input
                id="speakerRoleEn"
                dir="ltr"
                value={formData.speaker.role.en}
                onChange={(e) => updateSpeaker("role", "en", e.target.value)}
                placeholder={ui("e.g., Child Psychologist")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speakerRoleAr">{ui("Speaker Role/Title (Arabic)")}</Label>
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
          <CardTitle>{ui("Schedule & Location")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="dsc-form-grid">
            <div className="space-y-2">
              <Label htmlFor="dateTime">{ui("Date & Time *")}</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={formData.schedule.dateTime}
                onChange={(e) => updateSchedule("dateTime", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">{ui("Duration (minutes) *")}</Label>
              <Input
                id="duration"
                fieldWidth="short" type="number"
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

          <div className="dsc-form-grid">
            <div className="space-y-2">
              <Label htmlFor="attendanceMode">{lang === "ar" ? "طريقة الحضور" : "Attendance mode"}</Label>
              <Select value={formData.schedule.mode || "in_person"} disabled={isSubmitting}
                onValueChange={value => setFormData(previous => ({...previous, schedule:{...previous.schedule, mode:value as "in_person" | "online"}}))}>
                <SelectTrigger id="attendanceMode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">{lang === "ar" ? "حضوري" : "In person"}</SelectItem>
                  <SelectItem value="online">{lang === "ar" ? "عبر الشبكة" : "Online"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{lang === "ar" ? "المكان" : "Location"}{formData.schedule.mode !== "online" ? " *" : ""}</Label>
              <Input
                id="location"
                value={formData.schedule.location}
                onChange={(e) => updateSchedule("location", e.target.value)}
                placeholder={ui("e.g., Main Conference Hall")}
                required={formData.schedule.mode !== "online"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink">{ui("Meeting Link (for virtual lectures)")}</Label>
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
            <Label htmlFor="recordingUrl">{ui("Recording URL")}</Label>
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
          <CardTitle>{ui("Status")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">{ui("Public Visibility")}</Label>
              <p className="text-sm text-muted-foreground">
                {ui("Show this lecture on the public lectures page")}
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_public: checked })
              }
            />
          </div>
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
              <SelectValue placeholder={ui("Select status")} />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {ui(option.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {ui("Cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? ui("Saving...") : ui(submitLabel)}
        </Button>
      </div>
    </form>
  )
}
