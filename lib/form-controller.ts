import { FORM_STEPS } from "@/lib/form-config";
import { isQuestionVisible } from "@/lib/form-utils";
import { t, UI_STRINGS } from "@/lib/i18n";
import type {
  FormStep,
  Lang,
  Question,
  ValidationError,
} from "@/types/form";

function getSteps(): FormStep[] {
  return FORM_STEPS;
}

function getStep(stepId: string): FormStep | undefined {
  return FORM_STEPS.find((s) => s.id === stepId);
}

function getQuestionsByStep(stepId: string): Question[] {
  return getStep(stepId)?.questions ?? [];
}

function applyConditionalLogic(
  questions: Question[],
  answers: Record<string, unknown>,
): Question[] {
  return questions.filter((q) => isQuestionVisible(q, answers));
}

function getVisibleQuestions(
  stepId: string,
  answers: Record<string, unknown>,
): Question[] {
  return applyConditionalLogic(getQuestionsByStep(stepId), answers);
}

function validateStep(
  stepId: string,
  data: Record<string, unknown>,
  lang: Lang,
): ValidationError {
  const errors: ValidationError = {};

  for (const question of getVisibleQuestions(stepId, data)) {
    const value = data[question.id];

    // Required check
    if (question.required) {
      let isEmpty = false;
      if (Array.isArray(value)) {
        isEmpty = value.length === 0;
      } else if (typeof value === "number") {
        isEmpty = false; // 0 is a valid number entry
      } else {
        isEmpty = value === undefined || value === null || value === "";
      }
      if (isEmpty) {
        errors[question.id] = t(UI_STRINGS.required_error, lang);
        continue;
      }
    }

    // Explicit validation rules
    if (question.validation) {
      for (const rule of question.validation) {
        let failed = false;

        switch (rule.type) {
          case "required":
            failed = value === undefined || value === null || value === "";
            break;
          case "minLength":
            failed =
              typeof value === "string" &&
              value.length < (rule.value as number);
            break;
          case "maxLength":
            failed =
              typeof value === "string" &&
              value.length > (rule.value as number);
            break;
          case "pattern":
            failed =
              typeof value === "string" &&
              !new RegExp(rule.value as string).test(value);
            break;
          case "min":
            failed =
              typeof value === "number" && value < (rule.value as number);
            break;
          case "max":
            failed =
              typeof value === "number" && value > (rule.value as number);
            break;
        }

        if (failed) {
          errors[question.id] = t(rule.message, lang);
          break;
        }
      }
    }
  }

  return errors;
}

export const formController = {
  getSteps,
  getStep,
  getQuestionsByStep,
  applyConditionalLogic,
  getVisibleQuestions,
  validateStep,
};
