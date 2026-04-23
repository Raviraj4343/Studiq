export const GENAI_PROMPTS = {
  SYSTEM: "You are an academic assistant. Generate concise, exam-oriented output and respond with strict JSON only.",
  USER_TEMPLATE: (topics, questionCount) => `Given these ranked exam topics and normalized weights, produce:
1. ${questionCount} most expected questions
2. a last-day revision plan under 180 words

Topics:
${topics}

Keep the questions specific and exam-like. Keep the revision plan actionable and time-ordered.`
};

export const GENAI_LIMITS = {
  MAX_TOPICS: 15,
  MAX_QUESTIONS: 30,
  DEFAULT_QUESTION_COUNT: 10,
  MAX_OUTPUT_TOKENS: 800
};

export const GENAI_RESPONSE_TEMPLATE = `{
  "expectedQuestions": ["..."],
  "revisionPlan": "..."
}`;
