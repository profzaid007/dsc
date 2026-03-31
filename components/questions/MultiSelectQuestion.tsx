"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import type { Lang, Question } from "@/types/form";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  lang: Lang;
}

export function MultiSelectQuestion({
  question,
  value,
  onChange,
  error,
  lang,
}: Props) {
  const selected = (value as string[]) ?? [];

  function toggle(optValue: string) {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>
        {t(question.label, lang)}
        {question.required && <span className="ms-1 text-destructive">*</span>}
      </Label>
      <div
        className="flex flex-col gap-2"
        aria-describedby={error ? `${question.id}-error` : undefined}
      >
        {question.options?.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <Checkbox
              id={`${question.id}-${opt.value}`}
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            />
            <Label
              htmlFor={`${question.id}-${opt.value}`}
              className="cursor-pointer font-normal"
            >
              {t(opt.label, lang)}
            </Label>
          </div>
        ))}
      </div>
      {error && (
        <p id={`${question.id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
