"use client";

import { t, UI_STRINGS } from "@/lib/i18n";
import type { BilingualString, Lang } from "@/types/form";
import { cn } from "@/lib/utils";

interface Props {
  currentStep: number;
  totalSteps: number;
  stepTitle: BilingualString;
  lang: Lang;
}

export function ProgressBar({ currentStep, totalSteps, stepTitle, lang }: Props) {
  const percent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {t(UI_STRINGS.step, lang)} {currentStep + 1} {t(UI_STRINGS.of, lang)}{" "}
          {totalSteps}
        </span>
        <span className="font-medium text-foreground">{t(stepTitle, lang)}</span>
      </div>

      {/* Track — always LTR so the fill grows left-to-right */}
      <div dir="ltr" className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            backgroundColor: "var(--dsc-gold)",
          }}
        />
      </div>

      {/* Step dots */}
      <div dir="ltr" className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i <= currentStep ? "opacity-100" : "opacity-30",
            )}
            style={{
              backgroundColor:
                i <= currentStep ? "var(--dsc-gold)" : "var(--dsc-muted)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
