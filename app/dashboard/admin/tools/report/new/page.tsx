"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { toolTypesCollection } from "@/lib/pb-collections"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReportPreview } from "@/components/tool-renderers/ReportPreview"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"
import type { ReportConfig, ReportCustomField } from "@/types/tool"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function ReportBuilderPage() {
  const router = useRouter()
  const { assignTool } = useAssignments()
  const { getProfileById } = useProfiles()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportTypeId, setReportTypeId] = useState<string>("")
  const [typeError, setTypeError] = useState<string>("")

  const [selectedCaseId, setSelectedCaseId] = useState("")

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    expertNameEn: "Expert",
    expertNameAr: "خبير",
  })

  const [customFields, setCustomFields] = useState<ReportCustomField[]>([])

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

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId)
    if (caseId) {
      const caseProfile = getProfileById(caseId)
      if (caseProfile) {
        // Auto-populate report name with case name
        setFormData((prev) => ({
          ...prev,
          nameEn: `${caseProfile.name} - Report`,
          nameAr: `${caseProfile.name} - تقرير`,
        }))
      }
    } else {
      // Reset name fields when case is cleared
      setFormData((prev) => ({
        ...prev,
        nameEn: "",
        nameAr: "",
      }))
    }
  }

  const addField = () => {
    setCustomFields([
      ...customFields,
      { id: generateId(), label: { en: "", ar: "" }, type: "text" },
    ])
  }

  const updateField = (id: string, updates: Partial<ReportCustomField>) => {
    setCustomFields(
      customFields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    )
  }

  const removeField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id))
  }

  const handleSubmit = async () => {
    if (!selectedCaseId || !formData.nameEn || !reportTypeId) return
    setIsSubmitting(true)

    try {
      const config: ReportConfig = {
        title: { en: formData.nameEn, ar: formData.nameAr },
        expertNameField: {
          en: formData.expertNameEn,
          ar: formData.expertNameAr,
        },
        customFields,
        media: [],
      }

      // Create case document directly in case_tools (no tool template)
      await assignTool({
        case: selectedCaseId,
        type: reportTypeId,
        name_en: formData.nameEn,
        name_ar: formData.nameAr,
        is_not_template: true,
        config,
        is_visible_to_user: true,
        status: "pending",
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
    // Reset form instead of navigating back
    setSelectedCaseId("")
    setFormData({
      nameEn: "",
      nameAr: "",
      expertNameEn: "Expert",
      expertNameAr: "خبير",
    })
    setCustomFields([])
    setShowPreview(false)
  }

  const isFormValid = selectedCaseId && formData.nameEn && reportTypeId

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

          <Card>
            <CardHeader>
              <CardTitle>Report Name *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (EN)</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    placeholder="Report title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (AR)</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    placeholder="عنوان التقرير"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expert Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Expert Name (EN)</Label>
                  <Input
                    value={formData.expertNameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, expertNameEn: e.target.value })
                    }
                    placeholder="Expert name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expert Name (AR)</Label>
                  <Input
                    value={formData.expertNameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, expertNameAr: e.target.value })
                    }
                    placeholder="اسم الخبير"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Custom Fields</CardTitle>
              <Button size="sm" onClick={addField}>
                <Plus className="me-2 h-4 w-4" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {customFields.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No custom fields yet. Click Add Field to create one.
                </p>
              ) : (
                customFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Field {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Label (EN)"
                        value={field.label.en}
                        onChange={(e) =>
                          updateField(field.id, {
                            label: { ...field.label, en: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="العنوان (AR)"
                        value={field.label.ar}
                        onChange={(e) =>
                          updateField(field.id, {
                            label: { ...field.label, ar: e.target.value },
                          })
                        }
                      />
                    </div>
                    <Select
                      value={field.type}
                      onValueChange={(v) =>
                        updateField(field.id, {
                          type: v as ReportCustomField["type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
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
                title: { en: formData.nameEn, ar: formData.nameAr },
                expertNameField: {
                  en: formData.expertNameEn,
                  ar: formData.expertNameAr,
                },
                customFields,
                media: [],
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
