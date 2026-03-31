"use client";

import { Input } from "@/components/ui/input";
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

export function NumberQuestion({ question, value, onChange, error, lang }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={question.id}>
        {t(question.label, lang)}
        {question.required && <span className="ms-1 text-destructive">*</span>}
      </Label>
      <Input
        id={question.id}
        type="number"
        value={(value as number) ?? ""}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          onChange(isNaN(parsed) ? "" : parsed);
        }}
        placeholder={
          question.placeholder ? t(question.placeholder, lang) : undefined
        }
        aria-invalid={!!error}
        aria-describedby={error ? `${question.id}-error` : undefined}
      />
      {error && (
        <p id={`${question.id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
