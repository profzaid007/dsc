"use client";

import { Textarea } from "@/components/ui/textarea";
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

export function TextareaQuestion({ question, value, onChange, error, lang }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={question.id}>
        {t(question.label, lang)}
        {question.required && <span className="ms-1 text-destructive">*</span>}
      </Label>
      <Textarea
        id={question.id}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          question.placeholder ? t(question.placeholder, lang) : undefined
        }
        rows={4}
        className="resize-none"
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
