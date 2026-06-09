export type QuizContent = {
  question: string;
  options: { id: string; text: string; correct: boolean }[];
  explanation: string;
};

export type OrderStepsContent = {
  question: string;
  steps: { id: string; text: string }[];
  correctOrder: string[];
  explanation: string;
};

export type ErrorDetectionContent = {
  question: string;
  steps: { id: string; text: string; hasError?: boolean }[];
  explanation: string;
};

export function parseQuizContent(content: unknown): QuizContent | null {
  if (!content || typeof content !== "object") return null;
  const c = content as QuizContent;
  if (!c.question || !Array.isArray(c.options)) return null;
  return c;
}

export function parseOrderStepsContent(content: unknown): OrderStepsContent | null {
  if (!content || typeof content !== "object") return null;
  const c = content as OrderStepsContent;
  if (!c.question || !Array.isArray(c.steps) || !Array.isArray(c.correctOrder))
    return null;
  return c;
}

export function parseErrorDetectionContent(
  content: unknown
): ErrorDetectionContent | null {
  if (!content || typeof content !== "object") return null;
  const c = content as ErrorDetectionContent;
  if (!c.question || !Array.isArray(c.steps)) return null;
  return c;
}

export function getActivityExplanation(
  type: string,
  content: unknown
): string | undefined {
  if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") {
    return parseQuizContent(content)?.explanation;
  }
  if (type === "ORDER_STEPS") {
    return parseOrderStepsContent(content)?.explanation;
  }
  if (type === "ERROR_DETECTION") {
    return parseErrorDetectionContent(content)?.explanation;
  }
  return undefined;
}
