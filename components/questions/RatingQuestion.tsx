"use client";

import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import type { Lang, Question } from "@/types/form";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  lang: Lang;
}

const RATING_LABELS: Record<number, { en: string; ar: string }> = {
  1: { en: "Very Low", ar: "منخفض جداً" },
  2: { en: "Low", ar: "منخفض" },
  3: { en: "Medium", ar: "متوسط" },
  4: { en: "High", ar: "عالٍ" },
  5: { en: "Very High", ar: "عالٍ جداً" },
};

export function RatingQuestion({ question, value, onChange, error, lang }: Props) {
  const selected = (value as number) ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <Label>
        {t(question.label, lang)}
        {question.required && <span className="ms-1 text-destructive">*</span>}
      </Label>
      {/* Always LTR — ratings are universally left-to-right */}
      <div
        dir="ltr"
        className="flex gap-2"
        aria-describedby={error ? `${question.id}-error` : undefined}
      >
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            aria-label={`${rating} - ${t(RATING_LABELS[rating], lang)}`}
            aria-pressed={selected === rating}
            className={cn(
              "flex h-12 w-12 flex-col items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected === rating
                ? "border-transparent text-white"
                : "border-border bg-background text-muted-foreground hover:border-accent hover:text-accent",
            )}
            style={
              selected === rating
                ? { backgroundColor: "var(--dsc-gold)", borderColor: "var(--dsc-gold)" }
                : {}
            }
          >
            <span className="text-base">{rating}</span>
            <span className="text-[10px] leading-tight opacity-80">
              {t(RATING_LABELS[rating], lang)}
            </span>
          </button>
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
