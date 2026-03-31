import type { Question } from "@/types/form";

export function isQuestionVisible(
  question: Question,
  answers: Record<string, unknown>,
): boolean {
  if (!question.conditional) return true;
  return answers[question.conditional.questionId] === question.conditional.value;
}
