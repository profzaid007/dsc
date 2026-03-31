export interface BilingualString {
  en: string;
  ar: string;
}

export type QuestionType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "textarea"
  | "radio"
  | "rating";

export type ValidationRuleType =
  | "required"
  | "minLength"
  | "maxLength"
  | "pattern"
  | "min"
  | "max";

export interface ValidationRule {
  type: ValidationRuleType;
  value?: number | string;
  message: BilingualString;
}

export interface QuestionOption {
  value: string;
  label: BilingualString;
}

export interface ConditionalRule {
  questionId: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: BilingualString;
  placeholder?: BilingualString;
  options?: QuestionOption[];
  required?: boolean;
  validation?: ValidationRule[];
  conditional?: ConditionalRule;
}

export interface FormStep {
  id: string;
  title: BilingualString;
  description?: BilingualString;
  questions: Question[];
}

export type Lang = "en" | "ar";

export interface FormState {
  answers: Record<string, unknown>;
  currentStep: number;
  lang: Lang;
}

export type ValidationError = Record<string, string>;
