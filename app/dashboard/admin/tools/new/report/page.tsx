"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/useTools"
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
import { ReportPreview } from "@/components/tool-renderers/ReportPreview"
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import type { ReportConfig, ReportCustomField } from "@/types/tool"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function ReportBuilderPage() {
  const router = useRouter()
  const { addTool } = useTools()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    expertNameEn: "Expert Name",
    expertNameAr: "اسم الخبير",
  })

  const [customFields, setCustomFields] = useState<ReportCustomField[]>([])

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
    if (!formData.nameEn) return
    setIsSubmitting(true)

    const config: ReportConfig = {
      title: { en: formData.nameEn, ar: formData.nameAr },
      expertNameField: { en: formData.expertNameEn, ar: formData.expertNameAr },
      customFields,
      media: [],
    }

    const toolId = await addTool({
      name: { en: formData.nameEn, ar: formData.nameAr },
      type: "report",
      serviceType: "individual",
      status: "active",
      config,
    })

    router.push(`/dashboard/admin/tools`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Create Report</h1>
            <p className="text-muted-foreground">
              Fixed fields + custom fields
            </p>
          </div>
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

      <div
        className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Report Name (EN)</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    placeholder="Report title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Report Name (AR)</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    placeholder="عنوان التقرير"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Expert Name Label (EN)</Label>
                  <Input
                    value={formData.expertNameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, expertNameEn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expert Name Label (AR)</Label>
                  <Input
                    value={formData.expertNameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, expertNameAr: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fixed Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <div className="text-sm">
                  <span className="font-medium">Title</span> - user enters
                </div>
                <div className="text-sm">
                  <span className="font-medium">Date</span> - auto/today
                </div>
                <div className="text-sm">
                  <span className="font-medium">Expert Name</span> - uses label
                  above
                </div>
                <div className="text-sm">
                  <span className="font-medium">Assessment</span> - textarea
                </div>
                <div className="text-sm">
                  <span className="font-medium">Suggestions</span> - textarea
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Custom Fields (After Suggestions)</CardTitle>
              <Button size="sm" onClick={addField}>
                <Plus className="me-2 h-4 w-4" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {customFields.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No custom fields. Add one after Suggestions.
                </p>
              ) : (
                customFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="space-y-2 rounded-md border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Field {idx + 1}
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
                        placeholder="تسمية (AR)"
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
                          type: v as "text" | "textarea" | "date",
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
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
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.nameEn || isSubmitting}
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
