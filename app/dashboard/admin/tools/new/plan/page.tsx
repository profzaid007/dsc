"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/useTools"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DragList } from "@/components/ui/drag-list"
import { PlanPreview } from "@/components/tool-renderers/PlanPreview"
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import type { PlanConfig, PlanGoal, PlanStep } from "@/types/tool"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function PlanBuilderPage() {
  const router = useRouter()
  const { addTool } = useTools()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    childNameEn: "",
    childNameAr: "",
    expertNameEn: "",
    expertNameAr: "",
    startDate: "",
    endDate: "",
    isVisibleToUser: true,
  })

  const [goals, setGoals] = useState<PlanGoal[]>([])
  const [steps, setSteps] = useState<PlanStep[]>([])

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

  const handleSubmit = () => {
    if (
      !formData.childNameEn ||
      !formData.expertNameEn ||
      !formData.startDate ||
      !formData.endDate
    )
      return
    setIsSubmitting(true)

    const config: PlanConfig = {
      childName: { en: formData.childNameEn, ar: formData.childNameAr },
      expertName: { en: formData.expertNameEn, ar: formData.expertNameAr },
      startDate: formData.startDate,
      endDate: formData.endDate,
      goals: goals.map((g, idx) => ({ ...g, order: idx })),
      steps,
      isVisibleToUser: formData.isVisibleToUser,
    }

    const toolId = addTool({
      name: {
        en: `${formData.childNameEn} - Plan`,
        ar: `${formData.childNameAr} - خطة`,
      },
      type: "plan",
      serviceType: "individual",
      isVisibleToUser: formData.isVisibleToUser,
      status: "active",
      config,
    })

    router.push(`/dashboard/admin/tools`)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Create Plan</h1>
            <p className="text-muted-foreground">
              Child info, goals, and steps
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="visible"
                  checked={formData.isVisibleToUser}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, isVisibleToUser: !!v })
                  }
                />
                <Label htmlFor="visible">Visible to Users</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Goals (Drag to reorder)</CardTitle>
              <Button size="sm" onClick={addGoal}>
                <Plus className="me-2 h-4 w-4" />
                Add Goal
              </Button>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No goals yet.
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Steps</CardTitle>
              <Button size="sm" onClick={() => addStep()}>
                <Plus className="me-2 h-4 w-4" />
                Add Step
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No steps yet.
                </p>
              ) : (
                steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="space-y-2 rounded-md border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Step {idx + 1}
                      </span>
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
                            description: {
                              ...step.description,
                              en: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="الوصف (AR)"
                        value={step.description.ar}
                        onChange={(e) =>
                          updateStep(step.id, {
                            description: {
                              ...step.description,
                              ar: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Notes (EN)"
                        value={step.notes.en}
                        onChange={(e) =>
                          updateStep(step.id, {
                            notes: { ...step.notes, en: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="ملاحظات (AR)"
                        value={step.notes.ar}
                        onChange={(e) =>
                          updateStep(step.id, {
                            notes: { ...step.notes, ar: e.target.value },
                          })
                        }
                      />
                    </div>
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
              disabled={
                !formData.childNameEn ||
                !formData.expertNameEn ||
                !formData.startDate ||
                !formData.endDate ||
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
                isVisibleToUser: formData.isVisibleToUser,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
