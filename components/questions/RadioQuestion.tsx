"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

export function RadioQuestion({ question, value, onChange, error, lang }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Label>
        {t(question.label, lang)}
        {question.required && <span className="ms-1 text-destructive">*</span>}
      </Label>
      <RadioGroup
        value={(value as string) ?? ""}
        onValueChange={(val) => onChange(val)}
        aria-describedby={error ? `${question.id}-error` : undefined}
        className="flex flex-col gap-2"
      >
        {question.options?.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem
              value={opt.value}
              id={`${question.id}-${opt.value}`}
            />
            <Label
              htmlFor={`${question.id}-${opt.value}`}
              className="cursor-pointer font-normal"
            >
              {t(opt.label, lang)}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {error && (
        <p id={`${question.id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
