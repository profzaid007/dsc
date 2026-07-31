"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
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
import { Plus, Trash2, Calendar } from "lucide-react"
import type { CreateProgramInput, ProgramSchedule } from "@/types/training"

interface ProgramFormProps {
  initialData?: Partial<CreateProgramInput>
  onSubmit: (data: CreateProgramInput) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

const emptyForm: CreateProgramInput = {
  title: { en: "", ar: "" },
  category: { en: "", ar: "" },
  trainer: { name: { en: "", ar: "" }, role: { en: "", ar: "" } },
  coordinator: "",
  type: "in_person",
  location: "",
  duration: 1,
  schedule: { startDate: "", endDate: "", sessions: [] },
  isPublic: false,
  status: "draft",
}

export function ProgramForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save Program",
}: ProgramFormProps) {
  const [formData, setFormData] = useState<CreateProgramInput>(() => ({
    ...emptyForm,
    ...initialData,
    title: { ...emptyForm.title, ...initialData?.title },
    category: { ...emptyForm.category, ...initialData?.category },
    trainer: {
      ...emptyForm.trainer,
      ...initialData?.trainer,
      name: { ...emptyForm.trainer.name, ...initialData?.trainer?.name },
      role: { ...emptyForm.trainer.role, ...initialData?.trainer?.role },
    },
    schedule: {
      ...emptyForm.schedule,
      ...initialData?.schedule,
      sessions: initialData?.schedule?.sessions ?? [],
    },
    goals: initialData?.goals ?? emptyForm.goals,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const updateBilingual = (
    field: "title" | "category" | "goals",
    option: "en" | "ar",
    value: string
  ) => {
    setFormData({
      ...formData,
      [field]: { ...formData[field], [option]: value },
    })
  }

  const updateTrainer = (
    field: "name" | "role",
    option: "en" | "ar",
    value: string
  ) => {
    setFormData({
      ...formData,
      trainer: {
        ...formData.trainer,
        [field]: { ...formData.trainer[field], [option]: value },
      },
    })
  }

  const addSession = () => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        sessions: [
          ...formData.schedule.sessions,
          { date: "", timeFrom: "", timeTo: "", location: "" },
        ],
      },
    })
  }

  const removeSession = (index: number) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        sessions: formData.schedule.sessions.filter((_, i) => i !== index),
      },
    })
  }

  const updateSession = (
    index: number,
    field: keyof ProgramSchedule["sessions"][0],
    value: string
  ) => {
    const newSessions = [...formData.schedule.sessions]
    newSessions[index] = { ...newSessions[index], [field]: value }
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, sessions: newSessions },
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
                onChange={(e) => updateBilingual("title", "en", e.target.value)}
                placeholder="Program title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleAr">Title (Arabic) *</Label>
              <Input
                id="titleAr"
                value={formData.title.ar}
                onChange={(e) => updateBilingual("title", "ar", e.target.value)}
                placeholder="عنوان البرنامج"
                required
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoryEn">Category (English)</Label>
              <Input
                id="categoryEn"
                value={formData.category.en}
                onChange={(e) => updateBilingual("category", "en", e.target.value)}
                placeholder="e.g., Leadership"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryAr">Category (Arabic)</Label>
              <Input
                id="categoryAr"
                value={formData.category.ar}
                onChange={(e) => updateBilingual("category", "ar", e.target.value)}
                placeholder="مثال: القيادة"
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trainer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trainerNameEn">Trainer Name (English)</Label>
              <Input
                id="trainerNameEn"
                value={formData.trainer.name.en}
                onChange={(e) => updateTrainer("name", "en", e.target.value)}
                placeholder="Trainer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trainerNameAr">Trainer Name (Arabic)</Label>
              <Input
                id="trainerNameAr"
                value={formData.trainer.name.ar}
                onChange={(e) => updateTrainer("name", "ar", e.target.value)}
                placeholder="اسم المدرب"
                dir="rtl"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trainerRoleEn">Role (English)</Label>
              <Input
                id="trainerRoleEn"
                value={formData.trainer.role.en}
                onChange={(e) => updateTrainer("role", "en", e.target.value)}
                placeholder="e.g., Lead Instructor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trainerRoleAr">Role (Arabic)</Label>
              <Input
                id="trainerRoleAr"
                value={formData.trainer.role.ar}
                onChange={(e) => updateTrainer("role", "ar", e.target.value)}
                placeholder="الدور"
                dir="rtl"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coordinator">Coordinator</Label>
              <Input
                id="coordinator"
                value={formData.coordinator}
                onChange={(e) =>
                  setFormData({ ...formData, coordinator: e.target.value })
                }
                placeholder="Coordinator name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as CreateProgramInput["type"] })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In-Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
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
                placeholder="Unlimited if empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as CreateProgramInput["status"],
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">Public Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Show this program on the public programmes page
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublic: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Program Dates & Sessions
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DateInput
                id="startDate"
                value={formData.schedule.startDate}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, startDate: v },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <DateInput
                id="endDate"
                value={formData.schedule.endDate}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, endDate: v },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sessions</Label>
            {formData.schedule.sessions.map((session, idx) => (
              <div key={idx} className="flex items-end gap-2 rounded-md border p-3">
                <div className="grid gap-2 flex-1 grid-cols-4">
                  <DateInput
                    value={session.date}
                    onChange={(v) => updateSession(idx, "date", v)}
                    placeholder="Date"
                  />
                  <Input
                    type="time"
                    value={session.timeFrom}
                    onChange={(e) => updateSession(idx, "timeFrom", e.target.value)}
                    placeholder="From"
                  />
                  <Input
                    type="time"
                    value={session.timeTo}
                    onChange={(e) => updateSession(idx, "timeTo", e.target.value)}
                    placeholder="To"
                  />
                  <Input
                    value={session.location}
                    onChange={(e) => updateSession(idx, "location", e.target.value)}
                    placeholder="Location"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSession(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addSession}>
              <Plus className="me-2 h-4 w-4" />
              Add Session
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links & Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                value={formData.meetingLink || ""}
                onChange={(e) =>
                  setFormData({ ...formData, meetingLink: e.target.value })
                }
                placeholder="https://..."
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
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goalsEn">Goals (English)</Label>
              <Textarea
                id="goalsEn"
                value={formData.goals?.en || ""}
                onChange={(e) => updateBilingual("goals", "en", e.target.value)}
                placeholder="Program goals"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalsAr">Goals (Arabic)</Label>
              <Textarea
                id="goalsAr"
                value={formData.goals?.ar || ""}
                onChange={(e) => updateBilingual("goals", "ar", e.target.value)}
                placeholder="أهداف البرنامج"
                rows={2}
                dir="rtl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes"
              rows={2}
            />
          </div>
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
