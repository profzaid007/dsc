"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { FORM_STEPS } from "@/lib/form-config";
import { formController } from "@/lib/form-controller";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import type { ValidationError } from "@/types/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepRenderer } from "./StepRenderer";
import { ProgressBar } from "./ProgressBar";
import { NavigationButtons } from "./NavigationButtons";

const SUCCESS_STRINGS = {
  title: { en: "Application Received!", ar: "تم استلام طلبك!" },
  body: {
    en: "Thank you for taking the time to complete this form. Our team at DSC will review your application and reach out within 2–3 business days.",
    ar: "شكراً لك على إكمال هذا النموذج. سيقوم فريقنا في DSC بمراجعة طلبك والتواصل معك خلال 2-3 أيام عمل.",
  },
  restart: { en: "Submit Another Response", ar: "تقديم رد آخر" },
};

export function FormWizard() {
  const { lang } = useLang();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<ValidationError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const step = FORM_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FORM_STEPS.length - 1;

  function handleChange(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  }

  function handleNext() {
    const newErrors = formController.validateStep(step.id, answers, lang);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setErrors({});
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    setCurrentStep((prev) => prev - 1);
    setErrors({});
  }

  function handleSubmit() {
    setIsSubmitting(true);
    console.log("DSC Form Submission:", {
      submittedAt: new Date().toISOString(),
      lang,
      answers,
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500">
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--dsc-gold) 15%, transparent)",
              }}
            >
              <CheckCircle
                className="h-10 w-10"
                style={{ color: "var(--dsc-gold)" }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-primary">
                {t(SUCCESS_STRINGS.title, lang)}
              </h2>
              <p className="max-w-md text-muted-foreground">
                {t(SUCCESS_STRINGS.body, lang)}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setAnswers({});
                setCurrentStep(0);
                setErrors({});
              }}
            >
              {t(SUCCESS_STRINGS.restart, lang)}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar
        currentStep={currentStep}
        totalSteps={FORM_STEPS.length}
        stepTitle={step.title}
        lang={lang}
      />

      <div
        key={currentStep}
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <StepRenderer
          step={step}
          answers={answers}
          errors={errors}
          onChange={handleChange}
          lang={lang}
        />
      </div>

      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        lang={lang}
      />
    </div>
  );
}
