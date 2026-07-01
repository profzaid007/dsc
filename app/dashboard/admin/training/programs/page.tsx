"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useTraining } from "@/hooks/useTraining"
import type { CreateProgramInput, ProgramSchedule } from "@/types/training"
import { useLang } from "@/lib/lang-context"
import { Plus, Search, Trash2, Calendar } from "lucide-react"

const statusOptions = [
  { value: "draft", label: { en: "Draft", ar: "مسودة" } },
  { value: "published", label: { en: "Published", ar: "منشور" } },
  { value: "in_progress", label: { en: "In Progress", ar: "قيد التنفيذ" } },
  { value: "completed", label: { en: "Completed", ar: "مكتمل" } },
  { value: "cancelled", label: { en: "Cancelled", ar: "ملغي" } },
]

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

export default function TrainingProgramsAdminPage() {
  const { lang } = useLang()
  const {
    programs,
    isLoading,
    addProgram,
    updateProgram,
    deleteProgram,
  } = useTraining()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateProgramInput>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredPrograms = programs.filter((p) =>
    p.title[lang].toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (program: (typeof programs)[0]) => {
    setEditingId(program.id)
    setFormData({
      title: program.title,
      category: program.category,
      trainer: program.trainer,
      coordinator: program.coordinator,
      type: program.type,
      location: program.location,
      duration: program.duration,
      goals: program.goals,
      notes: program.notes,
      schedule: program.schedule,
      maxParticipants: program.maxParticipants,
      meetingLink: program.meetingLink,
      recordingUrl: program.recordingUrl,
      isPublic: program.isPublic,
      status: program.status,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateProgram(editingId, formData)
      } else {
        await addProgram(formData)
      }
      setFormData(emptyForm)
      setEditingId(null)
    } catch (err) {
      console.error("Failed to save program:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return
    await deleteProgram(id)
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

  const updateBilingual = (
    field: "title" | "category" | "goals",
    lang: "en" | "ar",
    value: string
  ) => {
    setFormData({
      ...formData,
      [field]: { ...formData[field], [lang]: value },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "ar" ? "البرامج التدريبية" : "Training Programs"}
        </h1>
        <Button onClick={() => { setEditingId(null); setFormData(emptyForm) }}>
          <Plus className="me-2 h-4 w-4" />
          {lang === "ar" ? "برنامج جديد" : "New Program"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={lang === "ar" ? "البحث..." : "Search programs..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-2">
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className={`cursor-pointer transition-colors ${
                  editingId === program.id ? "border-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => handleEdit(program)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{program.title[lang]}</p>
                      <p className="text-sm text-muted-foreground">
                        {program.category[lang]} | {program.duration} {lang === "ar" ? "أيام" : "days"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {statusOptions.find((s) => s.value === program.status)?.label[lang]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(program.id) }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId
                  ? lang === "ar" ? "تعديل البرنامج" : "Edit Program"
                  : lang === "ar" ? "برنامج جديد" : "New Program"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title (English) *</Label>
                    <Input
                      value={formData.title.en}
                      onChange={(e) => updateBilingual("title", "en", e.target.value)}
                      placeholder="Program title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (Arabic) *</Label>
                    <Input
                      value={formData.title.ar}
                      onChange={(e) => updateBilingual("title", "ar", e.target.value)}
                      placeholder="عنوان البرنامج"
                      required
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category (English)</Label>
                    <Input
                      value={formData.category.en}
                      onChange={(e) => updateBilingual("category", "en", e.target.value)}
                      placeholder="e.g., Leadership"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category (Arabic)</Label>
                    <Input
                      value={formData.category.ar}
                      onChange={(e) => updateBilingual("category", "ar", e.target.value)}
                      placeholder="مثال: القيادة"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Trainer */}
                <div className="space-y-4">
                  <Label className="font-semibold">Trainer</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      value={formData.trainer.name.en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trainer: {
                            ...formData.trainer,
                            name: { ...formData.trainer.name, en: e.target.value },
                          },
                        })
                      }
                      placeholder="Trainer name (English)"
                    />
                    <Input
                      value={formData.trainer.name.ar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trainer: {
                            ...formData.trainer,
                            name: { ...formData.trainer.name, ar: e.target.value },
                          },
                        })
                      }
                      placeholder="اسم المدرب"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      value={formData.trainer.role.en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trainer: {
                            ...formData.trainer,
                            role: { ...formData.trainer.role, en: e.target.value },
                          },
                        })
                      }
                      placeholder="Role (English)"
                    />
                    <Input
                      value={formData.trainer.role.ar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trainer: {
                            ...formData.trainer,
                            role: { ...formData.trainer.role, ar: e.target.value },
                          },
                        })
                      }
                      placeholder="الدور"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Basic fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Coordinator</Label>
                    <Input
                      value={formData.coordinator}
                      onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                      placeholder="Coordinator name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v as CreateProgramInput["type"] })}
                    >
                      <SelectTrigger>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (days)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Max Participants</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.maxParticipants || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Unlimited if empty"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as CreateProgramInput["status"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label[lang]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Checkbox
                        id="is-public"
                        checked={formData.isPublic}
                        onCheckedChange={(v) =>
                          setFormData({ ...formData, isPublic: v === true })
                        }
                      />
                      <Label htmlFor="is-public">Published (visible to users)</Label>
                    </div>
                  </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <Label className="font-semibold">Schedule</Label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={formData.schedule.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, startDate: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.schedule.endDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, endDate: e.target.value },
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
                          <Input
                            type="date"
                            value={session.date}
                            onChange={(e) => updateSession(idx, "date", e.target.value)}
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
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSession(idx)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addSession}>
                      <Plus className="me-2 h-4 w-4" />
                      Add Session
                    </Button>
                  </div>
                </div>

                {/* Links */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Meeting Link</Label>
                    <Input
                      value={formData.meetingLink || ""}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recording URL</Label>
                    <Input
                      value={formData.recordingUrl || ""}
                      onChange={(e) => setFormData({ ...formData, recordingUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Goals & Notes */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Goals (English)</Label>
                    <Textarea
                      value={formData.goals?.en || ""}
                      onChange={(e) => updateBilingual("goals", "en", e.target.value)}
                      placeholder="Program goals"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goals (Arabic)</Label>
                    <Textarea
                      value={formData.goals?.ar || ""}
                      onChange={(e) => updateBilingual("goals", "ar", e.target.value)}
                      placeholder="أهداف البرنامج"
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData(emptyForm) }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
