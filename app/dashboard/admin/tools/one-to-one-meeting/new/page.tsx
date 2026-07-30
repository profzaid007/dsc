"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { toolTypesCollection } from "@/lib/pb-collections"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import { Calendar, Eye, EyeOff, Loader2 } from "lucide-react"
import type { OneToOneMeetingConfig } from "@/types/tool"

export default function OneToOneMeetingNewPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string; edit?: string }>
}) {
  const router = useRouter()
  const { assignTool, updateAssignment, assignments, isLoading: isAssignmentsLoading } = useAssignments()
  const { getProfileById } = useProfiles()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meetingTypeId, setMeetingTypeId] = useState<string>("")
  const [typeError, setTypeError] = useState<string>("")
  const [editAssignmentId, setEditAssignmentId] = useState<string>("")

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)
  const hasInitialized = useRef(false)

  const [toolName, setToolName] = useState({ en: "", ar: "" })

  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [meetingType, setMeetingType] = useState<"online" | "face_to_face">("online")
  const [meetingLink, setMeetingLink] = useState("")
  const [meetingLocation, setMeetingLocation] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [notesVisible, setNotesVisible] = useState(false)

  useEffect(() => {
    const fetchType = async () => {
      try {
        const meetingType = await toolTypesCollection.getByName("one_to_one_meeting")
        setMeetingTypeId(meetingType.id)
        setTypeError("")
      } catch (error) {
        setTypeError('Tool type "one_to_one_meeting" not found. Please contact admin.')
        console.error("Failed to fetch meeting type:", error)
      }
    }
    fetchType()
  }, [])

  const handleCaseSelect = useCallback((caseId: string) => {
    setSelectedCaseId(caseId)
    if (caseId) {
      const caseProfile = getProfileById(caseId)
      if (caseProfile) {
        setToolName({
          en: `${caseProfile.name} - One to One Meeting`,
          ar: `${caseProfile.name} - اجتماع فردي`,
        })
      }
    } else {
      setToolName({ en: "", ar: "" })
    }
  }, [getProfileById])

  useEffect(() => {
    if (isAssignmentsLoading) return
    if (hasInitialized.current) return

    const initFromUrl = async () => {
      try {
        const params = await searchParams
        const editId = params?.edit
        const caseIdFromUrl = params?.caseId

        if (editId) {
          setEditAssignmentId(editId)
          const existingAssignment = assignments.find((a) => a.id === editId)
          if (existingAssignment) {
            const config = existingAssignment.config as OneToOneMeetingConfig
            setSelectedCaseId(existingAssignment.case)
            setToolName({
              en: existingAssignment.name_en || "",
              ar: existingAssignment.name_ar || "",
            })
            setMeetingDate(config?.date || "")
            setMeetingTime(config?.time || "")
            setMeetingType(config?.meetingType || "online")
            setMeetingLink(config?.meetingLink || "")
            setMeetingLocation(config?.location || "")
            setAdminNotes(config?.notes || "")
            setNotesVisible(config?.notesVisibleToUser || false)
          }
        } else if (caseIdFromUrl) {
          handleCaseSelect(caseIdFromUrl)
        }
      } catch (e) {
        console.error("Failed to read searchParams:", e)
      } finally {
        setIsInitializing(false)
        hasInitialized.current = true
      }
    }
    initFromUrl()
  }, [isAssignmentsLoading, assignments, searchParams, handleCaseSelect])

  const handleSubmit = async () => {
    if (!selectedCaseId || !toolName.en || !meetingDate || !meetingTime || !meetingTypeId) return
    setIsSubmitting(true)

    try {
      const config: OneToOneMeetingConfig = {
        date: meetingDate,
        time: meetingTime,
        meetingType,
        meetingLink: meetingType === "online" ? meetingLink : undefined,
        location: meetingType === "face_to_face" ? meetingLocation || undefined : undefined,
        notes: adminNotes || undefined,
        notesVisibleToUser: notesVisible,
        media: [],
      }

      if (editAssignmentId) {
        await updateAssignment(editAssignmentId, {
          name_en: toolName.en,
          name_ar: toolName.ar,
          config,
        })
        router.push(`/dashboard/admin/assignments/${editAssignmentId}`)
      } else {
        await assignTool({
          case: selectedCaseId,
          type: meetingTypeId,
          name_en: toolName.en,
          name_ar: toolName.ar,
          is_not_template: true,
          config,
          is_visible_to_user: true,
          status: "pending",
        })
        router.push("/dashboard/admin/assignments")
      }
    } catch (error) {
      console.error(editAssignmentId ? "Failed to update meeting:" : "Failed to create meeting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (editAssignmentId) {
      router.push(`/dashboard/admin/assignments/${editAssignmentId}`)
    } else {
      setSelectedCaseId("")
      setToolName({ en: "", ar: "" })
      setMeetingDate("")
      setMeetingTime("")
      setMeetingType("online")
      setMeetingLink("")
      setMeetingLocation("")
      setAdminNotes("")
      setNotesVisible(false)
      setShowPreview(false)
    }
  }

  const isFormValid = selectedCaseId && toolName.en && meetingDate && meetingTime && meetingTypeId

  if (typeError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive">{typeError}</p>
      </div>
    )
  }

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {editAssignmentId ? "Edit One to One Meeting" : "Create One to One Meeting"}
          </h1>
          <p className="text-muted-foreground">
            {editAssignmentId ? "Update the meeting for a specific case" : "Create a meeting for a specific case"}
          </p>
        </div>
        <Button
          variant={showPreview ? "default" : "outline"}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <EyeOff className="me-2 h-4 w-4" />
          ) : (
            <Eye className="me-2 h-4 w-4" />
          )}
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
      </div>

      {typeError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {typeError}
        </div>
      )}

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Case *</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseSearchCombobox
                value={selectedCaseId}
                onChange={handleCaseSelect}
                placeholder="Select a case..."
                disabled={!!editAssignmentId}
              />
              {!selectedCaseId && (
                <p className="mt-2 text-sm text-destructive">
                  Please select a case to continue
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meeting Name *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (EN)</Label>
                  <Input
                    value={toolName.en}
                    onChange={(e) => setToolName({ ...toolName, en: e.target.value })}
                    placeholder="e.g., Initial Assessment Meeting"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (AR)</Label>
                  <Input
                    value={toolName.ar}
                    onChange={(e) => setToolName({ ...toolName, ar: e.target.value })}
                    placeholder="مثال: اجتماع التقييم الأولي"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meeting Schedule *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meeting Type *</Label>
                <RadioGroup
                  value={meetingType}
                  onValueChange={(val) => setMeetingType(val as "online" | "face_to_face")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">Online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="face_to_face" id="face_to_face" />
                    <Label htmlFor="face_to_face">Face to Face</Label>
                  </div>
                </RadioGroup>
              </div>

              {meetingType === "online" ? (
                <div className="space-y-2">
                  <Label>Meeting Link *</Label>
                  <Input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="e.g., Room 201, Main Building"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this meeting..."
                rows={3}
              />
              <div className="flex items-center gap-2">
                <Switch
                  id="notes-visible"
                  checked={notesVisible}
                  onCheckedChange={setNotesVisible}
                />
                <Label htmlFor="notes-visible" className="text-sm text-muted-foreground">
                  Show notes to user
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editAssignmentId ? "Saving..." : "Creating..."}
                </>
              ) : editAssignmentId ? (
                "Save Changes"
              ) : (
                "Create Meeting"
              )}
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="sticky top-6 max-h-[calc(100vh-12rem)] overflow-auto rounded-lg border bg-card p-4">
            <p className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Live Preview
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                {toolName.en || "One to One Meeting"}
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{meetingDate || "—"}</span>
                  <span className="text-muted-foreground">Time:</span>
                  <span>{meetingTime || "—"}</span>
                  <span className="text-muted-foreground">Type:</span>
                  <span>{meetingType === "online" ? "Online" : "Face to Face"}</span>
                  {meetingType === "online" && (
                    <>
                      <span className="text-muted-foreground">Link:</span>
                      <span className="truncate">{meetingLink || "—"}</span>
                    </>
                  )}
                  {meetingType === "face_to_face" && (
                    <>
                      <span className="text-muted-foreground">Location:</span>
                      <span>{meetingLocation || "—"}</span>
                    </>
                  )}
                </div>
                {adminNotes && (
                  <div className="pt-2 border-t text-sm">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1 whitespace-pre-wrap">{adminNotes}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notesVisible ? "Visible to user" : "Admin only"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
