"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { t, UI_STRINGS } from "@/lib/i18n";
import type { Lang, Question } from "@/types/form";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  lang: Lang;
}

export function SelectQuestion({ question, value, onChange, error, lang }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={question.id}>
        {t(question.label, lang)}
        {question.required && <span className="ms-1 text-destructive">*</span>}
      </Label>
      <Select
        value={(value as string) ?? ""}
        onValueChange={(val) => onChange(val)}
      >
        <SelectTrigger
          id={question.id}
          aria-invalid={!!error}
          aria-describedby={error ? `${question.id}-error` : undefined}
        >
          <SelectValue placeholder={t(UI_STRINGS.select_placeholder, lang)} />
        </SelectTrigger>
        <SelectContent>
          {question.options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {t(opt.label, lang)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={`${question.id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
