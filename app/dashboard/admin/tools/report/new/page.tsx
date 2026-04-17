"use client"

import { useState, useEffect } from "react"
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
import { ReportPreview } from "@/components/tool-renderers/ReportPreview"
import { Eye, EyeOff } from "lucide-react"
import type { ReportConfig } from "@/types/tool"

export default function ReportBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>
}) {
  const router = useRouter()
  const { assignTool } = useAssignments()
  const { getProfileById } = useProfiles()
  const { currentUser } = useAuth()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportTypeId, setReportTypeId] = useState<string>("")
  const [typeError, setTypeError] = useState<string>("")

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)

  // Child name - from case selection
  const [childName, setChildName] = useState("")

  // Report name (bilingual) - goes directly to name_en/name_ar
  const [reportName, setReportName] = useState({
    en: "",
    ar: "",
  })

  // Expert name - single field, auto-filled from auth
  const [expertName, setExpertName] = useState("")

  // Fixed fields - stored in config
  const [fixedFields, setFixedFields] = useState({
    date: "",
    assessment: "",
    suggestions: "",
  })

  // Fetch report type ID on mount
  useEffect(() => {
    const fetchReportType = async () => {
      try {
        const reportType = await toolTypesCollection.getByName("report")
        setReportTypeId(reportType.id)
        setTypeError("")
      } catch (error) {
        setTypeError('Tool type "report" not found. Please contact admin.')
        console.error("Failed to fetch report type:", error)
      }
    }
    fetchReportType()
  }, [])

  // Auto-fill expert name when currentUser loads
  useEffect(() => {
    if (currentUser?.name) {
      setExpertName(currentUser.name)
    }
  }, [currentUser])

  // Initialize from URL caseId
  useEffect(() => {
    const initFromUrl = async () => {
      try {
        const params = await searchParams
        const caseIdFromUrl = params?.caseId
        if (caseIdFromUrl) {
          handleCaseSelect(caseIdFromUrl)
        }
      } catch (e) {
        console.error("Failed to read searchParams:", e)
      } finally {
        setIsInitializing(false)
      }
    }
    initFromUrl()
  }, [])

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId)
    if (caseId) {
      const caseProfile = getProfileById(caseId)
      if (caseProfile) {
        // Auto-populate child name and report name
        setChildName(caseProfile.name)
        setReportName({
          en: `${caseProfile.name} - Report`,
          ar: `${caseProfile.name} - تقرير`,
        })
      }
    } else {
      // Reset name fields when case is cleared
      setChildName("")
      setReportName({ en: "", ar: "" })
    }
  }

  const handleSubmit = async () => {
    if (!selectedCaseId || !reportName.en || !expertName || !reportTypeId)
      return
    setIsSubmitting(true)

    try {
      // Store fixed fields in config
      const config: ReportConfig = {
        title: { en: reportName.en, ar: reportName.ar },
        childName: childName,
        expertName: expertName,
        customFields: [],
        media: [],
        date: fixedFields.date || undefined,
        assessment: fixedFields.assessment,
        suggestions: fixedFields.suggestions,
      }

      // Create case document directly in case_tools (no tool template)
      await assignTool({
        case: selectedCaseId,
        type: reportTypeId,
        name_en: reportName.en,
        name_ar: reportName.ar,
        is_not_template: true,
        config,
        is_visible_to_user: true,
        status: "completed",
      })

      // Redirect to assignments page
      router.push(`/dashboard/admin/assignments`)
    } catch (error) {
      console.error("Failed to create report and assignment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reset form
    setSelectedCaseId("")
    setReportName({ en: "", ar: "" })
    setExpertName(currentUser?.name || "")
    setFixedFields({
      date: "",
      assessment: "",
      suggestions: "",
    })
    setShowPreview(false)
  }

  const isFormValid =
    selectedCaseId && reportName.en && expertName && reportTypeId

  if (typeError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive">{typeError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Create Report</h1>
          <p className="text-muted-foreground">
            Create a report for a specific case
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

      <div
        className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        <div className="space-y-6">
          {/* Case Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Case *</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseSearchCombobox
                value={selectedCaseId}
                onChange={handleCaseSelect}
                placeholder="Select a case..."
              />
              {!selectedCaseId && (
                <p className="mt-2 text-sm text-destructive">
                  Please select a case to continue
                </p>
              )}
            </CardContent>
          </Card>

          {/* Report Name - Bilingual (goes to name_en/name_ar) */}
          <Card>
            <CardHeader>
              <CardTitle>Report Name *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (EN)</Label>
                  <Input
                    value={reportName.en}
                    onChange={(e) =>
                      setReportName({ ...reportName, en: e.target.value })
                    }
                    placeholder="Report title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (AR)</Label>
                  <Input
                    value={reportName.ar}
                    onChange={(e) =>
                      setReportName({ ...reportName, ar: e.target.value })
                    }
                    placeholder="عنوان التقرير"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info - Child Name from Case + Expert Name */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Child Name</Label>
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Child name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expert Name</Label>
                  <Input
                    value={expertName}
                    onChange={(e) => setExpertName(e.target.value)}
                    placeholder="Expert name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fixed Fields - Date, Assessment, Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={fixedFields.date}
                  onChange={(e) =>
                    setFixedFields({ ...fixedFields, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Assessment</Label>
                <Textarea
                  value={fixedFields.assessment}
                  onChange={(e) =>
                    setFixedFields({
                      ...fixedFields,
                      assessment: e.target.value,
                    })
                  }
                  placeholder="Enter assessment..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Suggestions</Label>
                <Textarea
                  value={fixedFields.suggestions}
                  onChange={(e) =>
                    setFixedFields({
                      ...fixedFields,
                      suggestions: e.target.value,
                    })
                  }
                  placeholder="Enter suggestions..."
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
              {isSubmitting ? "Creating..." : "Create Report"}
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="sticky top-6 max-h-[calc(100vh-12rem)] overflow-auto rounded-lg border bg-card p-4">
            <p className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Live Preview
            </p>
            <ReportPreview
              config={{
                title: { en: reportName.en, ar: reportName.ar },
                childName: childName,
                expertName: expertName,
                customFields: [],
                media: [],
                date: fixedFields.date,
                assessment: fixedFields.assessment,
                suggestions: fixedFields.suggestions,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
