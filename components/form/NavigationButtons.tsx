"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, dir, UI_STRINGS } from "@/lib/i18n";
import type { Lang } from "@/types/form";

interface Props {
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  lang: Lang;
}

export function NavigationButtons({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
  lang,
}: Props) {
  const isRTL = dir(lang) === "rtl";
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center justify-between pt-2">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isFirstStep}
        className={isFirstStep ? "invisible" : ""}
      >
        <BackIcon className="me-1 h-4 w-4" />
        {t(UI_STRINGS.back, lang)}
      </Button>

      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="min-w-28"
      >
        {isSubmitting ? (
          t(UI_STRINGS.submitting, lang)
        ) : isLastStep ? (
          t(UI_STRINGS.submit, lang)
        ) : (
          <>
            {t(UI_STRINGS.next, lang)}
            <NextIcon className="ms-1 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
