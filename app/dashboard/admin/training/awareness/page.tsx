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
import type { CreateSessionInput } from "@/types/training"
import { useLang } from "@/lib/lang-context"
import { Plus, Search, Trash2, Calendar } from "lucide-react"

const statusOptions = [
  { value: "draft", label: { en: "Draft", ar: "مسودة" } },
  { value: "published", label: { en: "Published", ar: "منشور" } },
  { value: "in_progress", label: { en: "In Progress", ar: "قيد التنفيذ" } },
  { value: "completed", label: { en: "Completed", ar: "مكتمل" } },
  { value: "cancelled", label: { en: "Cancelled", ar: "ملغي" } },
]

const emptyForm: CreateSessionInput = {
  title: { en: "", ar: "" },
  category: { en: "", ar: "" },
  targetAudience: { en: "", ar: "" },
  speaker: { name: { en: "", ar: "" }, role: { en: "", ar: "" } },
  coordinator: "",
  type: "in_person",
  location: "",
  duration: 60,
  schedule: { date: "", timeFrom: "", timeTo: "", location: "" },
  isPublic: false,
  status: "draft",
}

export default function AwarenessSessionsAdminPage() {
  const { lang } = useLang()
  const {
    sessions,
    isLoading,
    addSession: createSession,
    updateSession,
    deleteSession,
  } = useTraining()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateSessionInput>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredSessions = sessions.filter((s) =>
    s.title[lang].toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (session: (typeof sessions)[0]) => {
    setEditingId(session.id)
    setFormData({
      title: session.title,
      category: session.category,
      targetAudience: session.targetAudience,
      speaker: session.speaker,
      coordinator: session.coordinator,
      type: session.type,
      location: session.location,
      duration: session.duration,
      schedule: session.schedule,
      notes: session.notes,
      maxParticipants: session.maxParticipants,
      meetingLink: session.meetingLink,
      recordingUrl: session.recordingUrl,
      isPublic: session.isPublic,
      status: session.status,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateSession(editingId, formData)
      } else {
        await createSession(formData)
      }
      setFormData(emptyForm)
      setEditingId(null)
    } catch (err) {
      console.error("Failed to save session:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return
    await deleteSession(id)
  }

  const updateBilingual = (
    field: "title" | "category" | "targetAudience",
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
          {lang === "ar" ? "جلسات التوعية" : "Awareness Sessions"}
        </h1>
        <Button onClick={() => { setEditingId(null); setFormData(emptyForm) }}>
          <Plus className="me-2 h-4 w-4" />
          {lang === "ar" ? "جلسة جديدة" : "New Session"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={lang === "ar" ? "البحث..." : "Search sessions..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-colors ${
                  editingId === session.id ? "border-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => handleEdit(session)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{session.title[lang]}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.category[lang]} | {session.schedule.timeFrom} - {session.schedule.timeTo}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {statusOptions.find((s) => s.value === session.status)?.label[lang]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(session.id) }}
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
                  ? lang === "ar" ? "تعديل الجلسة" : "Edit Session"
                  : lang === "ar" ? "جلسة جديدة" : "New Session"}
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
                      placeholder="Session title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (Arabic) *</Label>
                    <Input
                      value={formData.title.ar}
                      onChange={(e) => updateBilingual("title", "ar", e.target.value)}
                      placeholder="عنوان الجلسة"
                      required
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Category & Audience */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category (English)</Label>
                    <Input
                      value={formData.category.en}
                      onChange={(e) => updateBilingual("category", "en", e.target.value)}
                      placeholder="e.g., Safety"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category (Arabic)</Label>
                    <Input
                      value={formData.category.ar}
                      onChange={(e) => updateBilingual("category", "ar", e.target.value)}
                      placeholder="مثال: السلامة"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Target Audience (English)</Label>
                    <Input
                      value={formData.targetAudience.en}
                      onChange={(e) => updateBilingual("targetAudience", "en", e.target.value)}
                      placeholder="e.g., All Staff"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience (Arabic)</Label>
                    <Input
                      value={formData.targetAudience.ar}
                      onChange={(e) => updateBilingual("targetAudience", "ar", e.target.value)}
                      placeholder="مثال: جميع الموظفين"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Speaker */}
                <div className="space-y-4">
                  <Label className="font-semibold">Speaker</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      value={formData.speaker.name.en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          speaker: {
                            ...formData.speaker,
                            name: { ...formData.speaker.name, en: e.target.value },
                          },
                        })
                      }
                      placeholder="Speaker name (English)"
                    />
                    <Input
                      value={formData.speaker.name.ar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          speaker: {
                            ...formData.speaker,
                            name: { ...formData.speaker.name, ar: e.target.value },
                          },
                        })
                      }
                      placeholder="اسم المتحدث"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      value={formData.speaker.role.en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          speaker: {
                            ...formData.speaker,
                            role: { ...formData.speaker.role, en: e.target.value },
                          },
                        })
                      }
                      placeholder="Role (English)"
                    />
                    <Input
                      value={formData.speaker.role.ar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          speaker: {
                            ...formData.speaker,
                            role: { ...formData.speaker.role, ar: e.target.value },
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
                      onValueChange={(v) => setFormData({ ...formData, type: v as CreateSessionInput["type"] })}
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
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min={15}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
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
                      onValueChange={(v) => setFormData({ ...formData, status: v as CreateSessionInput["status"] })}
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
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={formData.schedule.date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, date: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time From</Label>
                      <Input
                        type="time"
                        value={formData.schedule.timeFrom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, timeFrom: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time To</Label>
                      <Input
                        type="time"
                        value={formData.schedule.timeTo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, timeTo: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Session Location</Label>
                    <Input
                      value={formData.schedule.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, location: e.target.value },
                        })
                      }
                      placeholder="Session location"
                    />
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

                {/* Notes */}
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
