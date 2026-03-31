"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DevBanner } from "@/components/dev/DevBanner";
import { FORM_STEPS } from "@/lib/form-config";
import { cn } from "@/lib/utils";

const totalQuestions = FORM_STEPS.reduce(
  (sum, step) => sum + step.questions.length,
  0,
);

export default function ConfigPreviewPage() {
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set());

  function toggleStep(id: string) {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <DevBanner />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--dsc-navy)" }}>
          Form Config Preview
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {FORM_STEPS.length} steps &bull; {totalQuestions} total questions
        </p>

        {/* Collapsible steps */}
        <div className="mb-8 flex flex-col gap-2">
          {FORM_STEPS.map((step, i) => {
            const isOpen = openSteps.has(step.id);
            return (
              <div
                key={step.id}
                className="overflow-hidden rounded-lg border bg-card"
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-start transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--dsc-navy)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-medium">{step.title.en}</span>
                    <span className="text-xs text-muted-foreground">
                      ({step.questions.length} questions)
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t px-4 py-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-start text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="pb-2 pe-4 text-start font-medium">ID</th>
                          <th className="pb-2 pe-4 text-start font-medium">Type</th>
                          <th className="pb-2 pe-4 text-start font-medium">Label (EN)</th>
                          <th className="pb-2 pe-4 text-start font-medium">Required</th>
                          <th className="pb-2 text-start font-medium">Conditional</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {step.questions.map((q) => (
                          <tr key={q.id} className="text-muted-foreground">
                            <td className="py-2 pe-4 font-mono text-xs">{q.id}</td>
                            <td className="py-2 pe-4">
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-xs font-medium",
                                  "bg-muted text-foreground",
                                )}
                              >
                                {q.type}
                              </span>
                            </td>
                            <td className="py-2 pe-4">{q.label.en}</td>
                            <td className="py-2 pe-4">
                              {q.required ? (
                                <span className="text-xs font-semibold text-green-600">Yes</span>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">—</span>
                              )}
                            </td>
                            <td className="py-2 text-xs">
                              {q.conditional ? (
                                <span className="font-mono text-amber-600">
                                  {q.conditional.questionId} = {q.conditional.value}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Full JSON */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Full JSON Config
          </h2>
          <pre className="max-h-[500px] overflow-auto rounded-lg border bg-muted p-4 text-xs leading-relaxed">
            {JSON.stringify(FORM_STEPS, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
