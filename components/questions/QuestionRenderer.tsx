"use client";

import { isQuestionVisible } from "@/lib/form-utils";
import type { Lang, Question, QuestionType } from "@/types/form";
import { TextQuestion } from "./TextQuestion";
import { NumberQuestion } from "./NumberQuestion";
import { TextareaQuestion } from "./TextareaQuestion";
import { SelectQuestion } from "./SelectQuestion";
import { RadioQuestion } from "./RadioQuestion";
import { MultiSelectQuestion } from "./MultiSelectQuestion";
import { RatingQuestion } from "./RatingQuestion";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  lang: Lang;
  answers: Record<string, unknown>;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
  lang,
  answers,
}: Props) {
  if (!isQuestionVisible(question, answers)) return null;

  const sharedProps = { question, value, onChange, error, lang };

  const type: QuestionType = question.type;

  switch (type) {
    case "text":
      return <TextQuestion {...sharedProps} />;
    case "number":
      return <NumberQuestion {...sharedProps} />;
    case "textarea":
      return <TextareaQuestion {...sharedProps} />;
    case "select":
      return <SelectQuestion {...sharedProps} />;
    case "radio":
      return <RadioQuestion {...sharedProps} />;
    case "multi-select":
      return <MultiSelectQuestion {...sharedProps} />;
    case "rating":
      return <RatingQuestion {...sharedProps} />;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
