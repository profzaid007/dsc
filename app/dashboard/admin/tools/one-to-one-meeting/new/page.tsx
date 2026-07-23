"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { useAuth } from "@/hooks/useAuth"
import { toolTypesCollection } from "@/lib/pb-collections"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import {
  PortalServiceSelector,
  type PortalServiceValue,
} from "@/components/register/PortalServiceSelector"
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
  const { currentUser } = useAuth()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meetingTypeId, setMeetingTypeId] = useState<string>("")
  const [typeError, setTypeError] = useState<string>("")
  const [editAssignmentId, setEditAssignmentId] = useState<string>("")

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)
  const hasInitialized = useRef(false)

  const [toolName, setToolName] = useState({ en: "", ar: "" })

  const [childName, setChildName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [description, setDescription] = useState("")
  const [portalService, setPortalService] = useState<PortalServiceValue>({
    categoryId: "",
    subCategoryId: "",
    customCategory: "",
    customSubCategory: "",
  })

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

  useEffect(() => {
    if (currentUser?.name) {
      setChildName(currentUser.name)
    }
  }, [currentUser])

  const handleCaseSelect = useCallback((caseId: string) => {
    setSelectedCaseId(caseId)
    if (caseId) {
      const caseProfile = getProfileById(caseId)
      if (caseProfile) {
        setChildName(caseProfile.name)
        setToolName({
          en: `${caseProfile.name} - One to One Meeting`,
          ar: `${caseProfile.name} - اجتماع فردي`,
        })
      }
    } else {
      setChildName("")
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
            setChildName(config?.childName || "")
            setContact(config?.contact || "")
            setEmail(config?.email || "")
            setDescription(config?.description || "")
            setPortalService({
              categoryId: "",
              subCategoryId: "",
              customCategory: config?.issueType || "",
              customSubCategory: config?.caseType || "",
            })
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
    if (!selectedCaseId || !toolName.en || !contact || !email || !meetingTypeId) return
    setIsSubmitting(true)

    try {
      const { categoryId, subCategoryId, customCategory, customSubCategory } = portalService

      const config: OneToOneMeetingConfig = {
        childName,
        contact,
        email,
        issueType: customCategory || categoryId,
        caseType: customSubCategory || subCategoryId,
        description: description || undefined,
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
      setChildName(currentUser?.name || "")
      setContact("")
      setEmail("")
      setDescription("")
      setPortalService({ categoryId: "", subCategoryId: "", customCategory: "", customSubCategory: "" })
      setShowPreview(false)
    }
  }

  const isFormValid = selectedCaseId && toolName.en && contact && email && meetingTypeId

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
              <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Child Name</Label>
                <Input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Child name"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact *</Label>
                <Input
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <PortalServiceSelector
                value={portalService}
                onChange={setPortalService}
              />
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the purpose of the meeting"
                  rows={4}
                />
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
                  <span className="text-muted-foreground">Child:</span>
                  <span>{childName || "—"}</span>
                  <span className="text-muted-foreground">Contact:</span>
                  <span>{contact || "—"}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span>{email || "—"}</span>
                </div>
                {(portalService.customCategory || portalService.categoryId) && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Issue Type:</span>
                    <span>{portalService.customCategory || portalService.categoryId}</span>
                  </div>
                )}
                {(portalService.customSubCategory || portalService.subCategoryId) && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Case Type:</span>
                    <span>{portalService.customSubCategory || portalService.subCategoryId}</span>
                  </div>
                )}
                {description && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 whitespace-pre-wrap">{description}</p>
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
