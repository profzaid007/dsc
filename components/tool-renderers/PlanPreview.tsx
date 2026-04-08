"use client"

import { useState } from "react"
import { useLang } from "@/lib/lang-context"
import type { PlanConfig } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface PlanPreviewProps {
  config: PlanConfig
}

export function PlanPreview({ config }: PlanPreviewProps) {
  const { lang } = useLang()
  const [stepValues, setStepValues] = useState<
    Record<
      string,
      {
        completed: boolean
        notes: string
        comments: string
        date: string
        evaluation: string
      }
    >
  >({})

  const updateStepValue = (stepId: string, field: string, value: unknown) => {
    setStepValues((prev) => ({
      ...prev,
      [stepId]: { ...prev[stepId], [field]: value },
    }))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Child:</span>{" "}
              {config.childName[lang]}
            </div>
            <div>
              <span className="font-medium">Expert:</span>{" "}
              {config.expertName[lang]}
            </div>
            <div>
              <span className="font-medium">Period:</span> {config.startDate} to{" "}
              {config.endDate}
            </div>
          </div>
        </CardContent>
      </Card>

      {config.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...config.goals]
              .sort((a, b) => a.order - b.order)
              .map((goal) => (
                <div key={goal.id} className="rounded border p-3">
                  <div className="font-medium">{goal.title[lang]}</div>
                  {goal.description && (
                    <div className="text-sm text-muted-foreground">
                      {goal.description[lang]}
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {config.steps.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No steps</p>
          ) : (
            config.steps.map((step, idx) => (
              <div key={step.id} className="space-y-2 rounded border p-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={stepValues[step.id]?.completed || step.completed}
                    onCheckedChange={(v) =>
                      updateStepValue(step.id, "completed", !!v)
                    }
                  />
                  <span className="font-medium">
                    Step {idx + 1}: {step.title[lang]}
                  </span>
                </div>
                {step.description[lang] && (
                  <p className="ms-6 text-sm text-muted-foreground">
                    {step.description[lang]}
                  </p>
                )}
                <div className="ms-6 grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Notes"
                    value={stepValues[step.id]?.notes || step.notes.en}
                    onChange={(e) =>
                      updateStepValue(step.id, "notes", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Comments"
                    value={stepValues[step.id]?.comments || step.comments.en}
                    onChange={(e) =>
                      updateStepValue(step.id, "comments", e.target.value)
                    }
                  />
                  <Input
                    type="date"
                    value={
                      stepValues[step.id]?.date || step.dateOfAchievement || ""
                    }
                    onChange={(e) =>
                      updateStepValue(step.id, "date", e.target.value)
                    }
                    placeholder="Achievement Date"
                  />
                  <Input
                    placeholder="Evaluation"
                    value={
                      stepValues[step.id]?.evaluation ||
                      step.evaluation?.en ||
                      ""
                    }
                    onChange={(e) =>
                      updateStepValue(step.id, "evaluation", e.target.value)
                    }
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button className="w-full">Save Plan</Button>
    </div>
  )
}
