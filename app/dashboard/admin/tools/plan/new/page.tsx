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
import { DragList } from "@/components/ui/drag-list"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import { PlanPreview } from "@/components/tool-renderers/PlanPreview"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"
import type { PlanConfig, PlanGoal, PlanStep } from "@/types/tool"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function PlanBuilderPage() {
  const router = useRouter()
  const { assignTool } = useAssignments()
  const { getProfileById } = useProfiles()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [planTypeId, setPlanTypeId] = useState<string>("")
  const [typeError, setTypeError] = useState<string>("")

  const [selectedCaseId, setSelectedCaseId] = useState("")

  // Tool name for this specific plan instance
  const [toolName, setToolName] = useState({
    en: "",
    ar: "",
  })

  const [formData, setFormData] = useState({
    childNameEn: "",
    childNameAr: "",
    expertNameEn: "Expert",
    expertNameAr: "خبير",
    startDate: "",
    endDate: "",
  })

  const [goals, setGoals] = useState<PlanGoal[]>([])
  const [steps, setSteps] = useState<PlanStep[]>([])

  // Fetch plan type ID on mount
  useEffect(() => {
    const fetchPlanType = async () => {
      try {
        const planType = await toolTypesCollection.getByName("plan")
        setPlanTypeId(planType.id)
        setTypeError("")
      } catch (error) {
        setTypeError('Tool type "plan" not found. Please contact admin.')
        console.error("Failed to fetch plan type:", error)
      }
    }
    fetchPlanType()
  }, [])

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId)
    if (caseId) {
      const caseProfile = getProfileById(caseId)
      if (caseProfile) {
        setFormData((prev) => ({
          ...prev,
          childNameEn: caseProfile.name,
          childNameAr: caseProfile.name,
        }))
        // Auto-generate tool name if empty
        setToolName((prev) => ({
          en: prev.en || `${caseProfile.name} - Plan`,
          ar: prev.ar || `${caseProfile.name} - خطة`,
        }))
      }
    } else {
      // Reset fields when case is cleared
      setFormData((prev) => ({
        ...prev,
        childNameEn: "",
        childNameAr: "",
      }))
    }
  }

  const addGoal = () => {
    setGoals([
      ...goals,
      {
        id: generateId(),
        title: { en: "", ar: "" },
        description: { en: "", ar: "" },
        order: goals.length,
      },
    ])
  }

  const updateGoal = (id: string, updates: Partial<PlanGoal>) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id))
  }

  const handleGoalReorder = (reordered: PlanGoal[]) => {
    setGoals(reordered)
  }

  const addStep = (goalId?: string) => {
    setSteps([
      ...steps,
      {
        id: generateId(),
        goalId,
        title: { en: "", ar: "" },
        description: { en: "", ar: "" },
        completed: false,
        notes: { en: "", ar: "" },
        comments: { en: "", ar: "" },
      },
    ])
  }

  const updateStep = (id: string, updates: Partial<PlanStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id))
  }

  const handleSubmit = async () => {
    if (
      !toolName.en ||
      !formData.childNameEn ||
      !formData.expertNameEn ||
      !formData.startDate ||
      !formData.endDate ||
      !selectedCaseId ||
      !planTypeId
    )
      return
    setIsSubmitting(true)

    try {
      const config: PlanConfig = {
        childName: { en: formData.childNameEn, ar: formData.childNameAr },
        expertName: { en: formData.expertNameEn, ar: formData.expertNameAr },
        startDate: formData.startDate,
        endDate: formData.endDate,
        goals: goals.map((g, idx) => ({ ...g, order: idx })),
        steps,
        media: [],
      }

      // Create case document directly in case_tools (no tool template)
      await assignTool({
        case: selectedCaseId,
        type: planTypeId,
        name_en: toolName.en,
        name_ar: toolName.ar,
        is_not_template: true,
        config,
        is_visible_to_user: true,
        status: "pending",
      })

      router.push("/dashboard/admin/assignments")
    } catch (error) {
      console.error("Failed to create plan:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reset form
    setSelectedCaseId("")
    setToolName({ en: "", ar: "" })
    setFormData({
      childNameEn: "",
      childNameAr: "",
      expertNameEn: "Expert",
      expertNameAr: "خبير",
      startDate: "",
      endDate: "",
    })
    setGoals([])
    setSteps([])
    setShowPreview(false)
  }

  const renderGoalItem = (goal: PlanGoal, index: number) => (
    <div className="flex-1 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Goal {index + 1}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => removeGoal(goal.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Goal Title (EN)"
          value={goal.title.en}
          onChange={(e) =>
            updateGoal(goal.id, {
              title: { ...goal.title, en: e.target.value },
            })
          }
        />
        <Input
          placeholder="عنوان الهدف (AR)"
          value={goal.title.ar}
          onChange={(e) =>
            updateGoal(goal.id, {
              title: { ...goal.title, ar: e.target.value },
            })
          }
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Description (EN)"
          value={goal.description?.en || ""}
          onChange={(e) =>
            updateGoal(goal.id, {
              description: {
                en: e.target.value,
                ar: goal.description?.ar || "",
              },
            })
          }
        />
        <Input
          placeholder="الوصف (AR)"
          value={goal.description?.ar || ""}
          onChange={(e) =>
            updateGoal(goal.id, {
              description: {
                en: goal.description?.en || "",
                ar: e.target.value,
              },
            })
          }
        />
      </div>
    </div>
  )

  const renderStepItem = (step: PlanStep, index: number) => (
    <div className="flex-1 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Step {index + 1}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => removeStep(step.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Step Title (EN)"
          value={step.title.en}
          onChange={(e) =>
            updateStep(step.id, {
              title: { ...step.title, en: e.target.value },
            })
          }
        />
        <Input
          placeholder="عنوان الخطوة (AR)"
          value={step.title.ar}
          onChange={(e) =>
            updateStep(step.id, {
              title: { ...step.title, ar: e.target.value },
            })
          }
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Description (EN)"
          value={step.description.en}
          onChange={(e) =>
            updateStep(step.id, {
              description: { ...step.description, en: e.target.value },
            })
          }
        />
        <Input
          placeholder="الوصف (AR)"
          value={step.description.ar}
          onChange={(e) =>
            updateStep(step.id, {
              description: { ...step.description, ar: e.target.value },
            })
          }
        />
      </div>
    </div>
  )

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
          <h1 className="text-2xl font-bold text-primary">Create Plan</h1>
          <p className="text-muted-foreground">
            Create a plan for a specific case
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
              <CardTitle>Case Selection *</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseSearchCombobox
                value={selectedCaseId}
                onChange={handleCaseSelect}
                placeholder="Select a case..."
              />
            </CardContent>
          </Card>

          {/* Plan Name */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Name *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (EN)</Label>
                  <Input
                    value={toolName.en}
                    onChange={(e) =>
                      setToolName({ ...toolName, en: e.target.value })
                    }
                    placeholder="e.g., John's Development Plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (AR)</Label>
                  <Input
                    value={toolName.ar}
                    onChange={(e) =>
                      setToolName({ ...toolName, ar: e.target.value })
                    }
                    placeholder="مثال: خطة تطوير جون"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Child & Expert Info */}
          <Card>
            <CardHeader>
              <CardTitle>Child & Expert Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Child Name (EN)</Label>
                  <Input
                    value={formData.childNameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, childNameEn: e.target.value })
                    }
                    placeholder="Child name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Child Name (AR)</Label>
                  <Input
                    value={formData.childNameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, childNameAr: e.target.value })
                    }
                    placeholder="اسم الطفل"
                  />
                </div>
              </div>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Goals</CardTitle>
              <Button size="sm" onClick={addGoal}>
                <Plus className="me-2 h-4 w-4" />
                Add Goal
              </Button>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No goals yet. Click Add Goal to create one.
                </p>
              ) : (
                <DragList
                  items={goals}
                  onReorder={handleGoalReorder}
                  renderItem={renderGoalItem}
                  keyExtractor={(g) => g.id}
                />
              )}
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Steps</CardTitle>
              <Button size="sm" onClick={() => addStep()}>
                <Plus className="me-2 h-4 w-4" />
                Add Step
              </Button>
            </CardHeader>
            <CardContent>
              {steps.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No steps yet. Click Add Step to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, idx) => (
                    <div key={step.id}>{renderStepItem(step, idx)}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !toolName.en ||
                !formData.childNameEn ||
                !formData.startDate ||
                !formData.endDate ||
                !selectedCaseId ||
                !planTypeId ||
                isSubmitting
              }
            >
              {isSubmitting ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="sticky top-6 max-h-[calc(100vh-12rem)] overflow-auto rounded-lg border bg-card p-4">
            <p className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Live Preview
            </p>
            <PlanPreview
              config={{
                childName: {
                  en: formData.childNameEn,
                  ar: formData.childNameAr,
                },
                expertName: {
                  en: formData.expertNameEn,
                  ar: formData.expertNameAr,
                },
                startDate: formData.startDate,
                endDate: formData.endDate,
                goals,
                steps,
                media: [],
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
