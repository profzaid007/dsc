"use client";

import { useState } from "react";
import { Plus, Pencil, Check, Copy } from "lucide-react";
import { DevBanner } from "@/components/dev/DevBanner";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";
import { FORM_STEPS } from "@/lib/form-config";
import { useLang } from "@/lib/lang-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FormStep, Question, QuestionOption, QuestionType } from "@/types/form";

const QUESTION_TYPES: QuestionType[] = [
  "text",
  "number",
  "textarea",
  "select",
  "radio",
  "multi-select",
  "rating",
];

function parseOptions(raw: string): QuestionOption[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value = "", labelEn = "", labelAr = ""] = line.split("|");
      return {
        value: value.trim(),
        label: { en: labelEn.trim(), ar: labelAr.trim() },
      };
    });
}

function serializeOptions(options: QuestionOption[] = []): string {
  return options.map((o) => `${o.value}|${o.label.en}|${o.label.ar}`).join("\n");
}

const hasOptions = (type: QuestionType) =>
  ["select", "radio", "multi-select"].includes(type);

export default function DevBuilderPage() {
  const { lang } = useLang();
  const [steps, setSteps] = useState<FormStep[]>(() =>
    JSON.parse(JSON.stringify(FORM_STEPS)),
  );
  const [selectedStepId, setSelectedStepId] = useState<string>(FORM_STEPS[0].id);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});
  const [copied, setCopied] = useState(false);

  const selectedStep = steps.find((s) => s.id === selectedStepId)!;
  const editingQuestion = selectedStep?.questions.find(
    (q) => q.id === editingQuestionId,
  );

  function updateQuestion(id: string, patch: Partial<Question>) {
    setSteps((prev) =>
      prev.map((step) =>
        step.id !== selectedStepId
          ? step
          : {
              ...step,
              questions: step.questions.map((q) =>
                q.id === id ? { ...q, ...patch } : q,
              ),
            },
      ),
    );
  }

  function addQuestion() {
    const id = `q_${Date.now()}`;
    const newQ: Question = {
      id,
      type: "text",
      label: { en: "New Question", ar: "سؤال جديد" },
      required: false,
    };
    setSteps((prev) =>
      prev.map((step) =>
        step.id !== selectedStepId
          ? step
          : { ...step, questions: [...step.questions, newQ] },
      ),
    );
    setEditingQuestionId(id);
  }

  function copyConfig() {
    navigator.clipboard.writeText(JSON.stringify(steps, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background">
      <DevBanner />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--dsc-navy)" }}>
              Question Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Edit questions and preview them live. Copy the JSON to update your config.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyConfig}
            className="gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Config JSON
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
          {/* Left: Step list */}
          <div className="flex flex-col gap-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Steps
            </p>
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => {
                  setSelectedStepId(step.id);
                  setEditingQuestionId(null);
                }}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-start text-sm transition-colors",
                  selectedStepId === step.id
                    ? "font-semibold text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                style={
                  selectedStepId === step.id
                    ? { backgroundColor: "var(--dsc-navy)" }
                    : {}
                }
              >
                <span className="me-2 text-xs opacity-60">{i + 1}.</span>
                {step.title.en}
              </button>
            ))}
          </div>

          {/* Right: Step detail */}
          <div className="flex flex-col gap-4">
            {/* Step header */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                {selectedStep?.title.en}
                <span className="ms-2 text-sm font-normal text-muted-foreground">
                  ({selectedStep?.questions.length} questions)
                </span>
              </h2>
              <Button size="sm" onClick={addQuestion} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>

            {/* Question list */}
            <div className="flex flex-col gap-2">
              {selectedStep?.questions.map((q) => (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-lg border bg-card transition-colors",
                    editingQuestionId === q.id && "border-primary",
                  )}
                >
                  {/* Question row header */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {q.type}
                      </span>
                      <span className="font-medium">{q.label.en || "(no label)"}</span>
                      {q.required && (
                        <span className="text-xs text-destructive">*required</span>
                      )}
                      {q.conditional && (
                        <span className="text-xs text-amber-600">conditional</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingQuestionId(
                          editingQuestionId === q.id ? null : q.id,
                        )
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Inline edit form */}
                  {editingQuestionId === q.id && editingQuestion && (
                    <div className="border-t px-4 py-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Left: Edit fields */}
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <Label>Type</Label>
                            <Select
                              value={editingQuestion.type}
                              onValueChange={(val) =>
                                updateQuestion(q.id, {
                                  type: val as QuestionType,
                                  options: hasOptions(val as QuestionType)
                                    ? editingQuestion.options ?? []
                                    : undefined,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {QUESTION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <Label>Label (English)</Label>
                            <Input
                              value={editingQuestion.label.en}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  label: {
                                    ...editingQuestion.label,
                                    en: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <Label>Label (Arabic)</Label>
                            <Input
                              dir="rtl"
                              value={editingQuestion.label.ar}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  label: {
                                    ...editingQuestion.label,
                                    ar: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`req-${q.id}`}
                              checked={!!editingQuestion.required}
                              onCheckedChange={(checked) =>
                                updateQuestion(q.id, { required: !!checked })
                              }
                            />
                            <Label htmlFor={`req-${q.id}`} className="cursor-pointer font-normal">
                              Required
                            </Label>
                          </div>

                          {hasOptions(editingQuestion.type) && (
                            <div className="flex flex-col gap-1.5">
                              <Label>
                                Options{" "}
                                <span className="text-xs text-muted-foreground">
                                  (one per line: value|EN label|AR label)
                                </span>
                              </Label>
                              <Textarea
                                rows={5}
                                className="resize-none font-mono text-xs"
                                value={serializeOptions(editingQuestion.options)}
                                onChange={(e) =>
                                  updateQuestion(q.id, {
                                    options: parseOptions(e.target.value),
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>

                        {/* Right: Live preview */}
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Live Preview
                          </p>
                          <Card className="min-h-24 bg-muted/30">
                            <CardContent className="pt-4">
                              <QuestionRenderer
                                question={editingQuestion}
                                value={previewAnswers[editingQuestion.id]}
                                onChange={(v) =>
                                  setPreviewAnswers((prev) => ({
                                    ...prev,
                                    [editingQuestion.id]: v,
                                  }))
                                }
                                lang={lang}
                                answers={previewAnswers}
                              />
                            </CardContent>
                          </Card>
                          <p className="text-xs text-muted-foreground">
                            Current value:{" "}
                            <span className="font-mono">
                              {JSON.stringify(previewAnswers[editingQuestion.id] ?? null)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
