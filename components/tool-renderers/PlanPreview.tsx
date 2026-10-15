"use client"
import { useUiTranslation } from "@/hooks/useUiTranslation"

import { useLang } from "@/lib/lang-context"
import { formatDate } from "@/lib/format-date"
import { DateInput } from "@/components/ui/date-input"
import type { BilingualString, PlanConfig } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export function PlanPreview({ config }: { config: PlanConfig }) {
  const ui = useUiTranslation()

  const { lang } = useLang()

  const getBilingualValue = (value?: string | BilingualString) => {
    if (!value) return ""
    return typeof value === "string" ? value : value[lang] || ""
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ui("Plan Info")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">{ui("Child:")}</span>{" "}
              {getBilingualValue(config.childName)}
            </div>
            <div>
              <span className="font-medium">{ui("Expert:")}</span>{" "}
              {getBilingualValue(config.expertName)}
            </div>
            <div>
              <span className="font-medium">{ui("Period:")}</span> {formatDate(config.startDate)} {ui("to")}{" "}
              {formatDate(config.endDate)}
            </div>
          </div>
        </CardContent>
      </Card>

      {config.goals && config.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ui("Goals")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...config.goals]
              .sort((a, b) => a.order - b.order)
              .map((goal, idx) => (
                <div key={goal.id} className="rounded border p-3">
                  <div className="font-medium">
                    {ui("Goal")} {idx + 1}: {getBilingualValue(goal.title)}
                  </div>
                  {goal.description && (
                    <div className="text-sm text-muted-foreground">
                      {getBilingualValue(goal.description)}
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {config.steps && config.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ui("Steps")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {config.steps.map((step, idx) => (
              <div key={step.id} className="space-y-2 rounded border p-3">
                <div className="flex items-center gap-2">
                  <Checkbox checked={step.completed} disabled />
                  <span className="font-medium">
                    {ui("Step")} {idx + 1}: {getBilingualValue(step.title)}
                  </span>
                </div>
                {step.description && (
                  <p className="ms-6 text-sm text-muted-foreground">
                    {getBilingualValue(step.description)}
                  </p>
                )}
                <div className="ms-6 grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder={ui("Notes")}
                    value={getBilingualValue(step.notes)}
                    readOnly
                  />
                  <Input
                    placeholder={ui("Comments")}
                    value={getBilingualValue(step.comments)}
                    readOnly
                  />
                  <DateInput
                    value={step.dateOfAchievement || ""}
                    readOnly
                  />
                  <Input
                    placeholder={ui("Evaluation")}
                    value={getBilingualValue(step.evaluation)}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
