"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { useAuth } from "@/hooks/useAuth"
import { toolTypesCollection } from "@/lib/pb-collections"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DragList } from "@/components/ui/drag-list"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import { PlanPreview } from "@/components/tool-renderers/PlanPreview"
import { Plus, Trash2, Eye, EyeOff, GripVertical } from "lucide-react"
import type { PlanConfig } from "@/types/tool"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Simple interfaces for admin form (non-bilingual except plan name)
interface SimplePlanGoal {
  id: string
  title: string
  description: string
  order: number
}

interface SimplePlanStep {
  id: string
  goalId?: string
  title: string
  description: string
  notes: string
  comments: string
  dateOfAchievement: string
  evaluation: string
  completed: boolean
  order: number
}

export default function PlanBuilderPage({
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
  const [planTypeId, setPlanTypeId] = useState<string>("")
  const [typeError, setTypeError] = useState<string>("")

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)

  // Tool name for this specific plan instance (only bilingual field)
  const [toolName, setToolName] = useState({
    en: "",
    ar: "",
  })

  const [formData, setFormData] = useState({
    childName: "",
    expertName: "",
    startDate: "",
    endDate: "",
  })

  const [goals, setGoals] = useState<SimplePlanGoal[]>([])
  const [steps, setSteps] = useState<SimplePlanStep[]>([])

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

  // Update expert name when currentUser loads
  useEffect(() => {
    if (currentUser?.name) {
      setFormData((prev) => ({
        ...prev,
        expertName: currentUser.name,
      }))
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
        setFormData((prev) => ({
          ...prev,
          childName: caseProfile.name,
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
        childName: "",
      }))
    }
  }

  const addGoal = () => {
    setGoals([
      ...goals,
      {
        id: generateId(),
        title: "",
        description: "",
        order: goals.length,
      },
    ])
  }

  const updateGoal = (id: string, updates: Partial<SimplePlanGoal>) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id))
  }

  const handleGoalReorder = (reordered: SimplePlanGoal[]) => {
    setGoals(reordered.map((g, idx) => ({ ...g, order: idx })))
  }

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: generateId(),
        title: "",
        description: "",
        notes: "",
        comments: "",
        dateOfAchievement: "",
        evaluation: "",
        completed: false,
        order: steps.length,
      },
    ])
  }

  const updateStep = (id: string, updates: Partial<SimplePlanStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id))
  }

  const handleStepReorder = (reordered: SimplePlanStep[]) => {
    setSteps(reordered.map((s, idx) => ({ ...s, order: idx })))
  }

  const handleSubmit = async () => {
    if (
      !toolName.en ||
      !formData.childName ||
      !formData.expertName ||
      !formData.startDate ||
      !formData.endDate ||
      !selectedCaseId ||
      !planTypeId
    )
      return
    setIsSubmitting(true)

    try {
      // Convert simple form data to bilingual config for storage
      const config: PlanConfig = {
        childName: formData.childName,
        expertName: formData.expertName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        goals: goals.map((g, idx) => ({
          id: g.id,
          title: g.title,
          description: g.description,
          order: idx,
        })),
        steps: steps.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          notes: s.notes,
          comments: s.comments,
          dateOfAchievement: s.dateOfAchievement || undefined,
          evaluation: s.evaluation,
          completed: s.completed,
        })),
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
      childName: "",
      expertName: currentUser?.name || "",
      startDate: "",
      endDate: "",
    })
    setGoals([])
    setSteps([])
    setShowPreview(false)
  }

  const renderGoalItem = (goal: SimplePlanGoal, index: number) => (
    <div className="flex-1 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Goal {index + 1}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => removeGoal(goal.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Goal Title"
          value={goal.title}
          onChange={(e) => updateGoal(goal.id, { title: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={goal.description}
          onChange={(e) => updateGoal(goal.id, { description: e.target.value })}
        />
      </div>
    </div>
  )

  const renderStepItem = (step: SimplePlanStep, index: number) => (
    <div className="flex-1 space-y-3 rounded border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={step.completed}
            onCheckedChange={(checked) =>
              updateStep(step.id, { completed: !!checked })
            }
          />
          <span className="font-medium">Step {index + 1}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => removeStep(step.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Step Title"
          value={step.title}
          onChange={(e) => updateStep(step.id, { title: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={step.description}
          onChange={(e) => updateStep(step.id, { description: e.target.value })}
        />

        {/* Fields matching preview layout */}
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Notes"
            value={step.notes}
            onChange={(e) => updateStep(step.id, { notes: e.target.value })}
          />
          <Input
            placeholder="Comments"
            value={step.comments}
            onChange={(e) => updateStep(step.id, { comments: e.target.value })}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            type="date"
            placeholder="Date of Achievement"
            value={step.dateOfAchievement}
            onChange={(e) =>
              updateStep(step.id, { dateOfAchievement: e.target.value })
            }
          />
          <Input
            placeholder="Evaluation"
            value={step.evaluation}
            onChange={(e) =>
              updateStep(step.id, { evaluation: e.target.value })
            }
          />
        </div>
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

          {/* Plan Name - Only bilingual field */}
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

          {/* Child & Expert Info - Single fields */}
          <Card>
            <CardHeader>
              <CardTitle>Child & Expert Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Child Name</Label>
                  <Input
                    value={formData.childName}
                    onChange={(e) =>
                      setFormData({ ...formData, childName: e.target.value })
                    }
                    placeholder="Child name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expert Name</Label>
                  <Input
                    value={formData.expertName}
                    onChange={(e) =>
                      setFormData({ ...formData, expertName: e.target.value })
                    }
                    placeholder="Expert name"
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

          {/* Goals - Single fields */}
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

          {/* Steps - With all fields matching preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Steps</CardTitle>
              <Button size="sm" onClick={addStep}>
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
                <DragList
                  items={steps}
                  onReorder={handleStepReorder}
                  renderItem={renderStepItem}
                  keyExtractor={(s) => s.id}
                />
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
                !formData.childName ||
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
                childName: formData.childName,
                expertName: formData.expertName,
                startDate: formData.startDate,
                endDate: formData.endDate,
                goals: goals.map((g) => ({
                  id: g.id,
                  title: g.title,
                  description: g.description,
                  order: g.order,
                })),
                steps: steps.map((s) => ({
                  id: s.id,
                  title: s.title,
                  description: s.description,
                  notes: s.notes,
                  comments: s.comments,
                  dateOfAchievement: s.dateOfAchievement || undefined,
                  evaluation: s.evaluation,
                  completed: s.completed,
                })),
                media: [],
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
