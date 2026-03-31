"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";
import { t } from "@/lib/i18n";
import type { FormStep, Lang, ValidationError } from "@/types/form";

interface Props {
  step: FormStep;
  answers: Record<string, unknown>;
  errors: ValidationError;
  onChange: (questionId: string, value: unknown) => void;
  lang: Lang;
}

export function StepRenderer({ step, answers, errors, onChange, lang }: Props) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          {t(step.title, lang)}
        </CardTitle>
        {step.description && (
          <CardDescription className="text-base">
            {t(step.description, lang)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {step.questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(val) => onChange(question.id, val)}
            error={errors[question.id]}
            lang={lang}
            answers={answers}
          />
        ))}
      </CardContent>
    </Card>
  );
}
