import axios from "axios";

import { appConfig } from "../config/env.js";
import { GENAI_LIMITS, GENAI_PROMPTS, GENAI_RESPONSE_TEMPLATE } from "../constants/genai.constants.js";
import { buildPyqRevisionPlan, extractRepeatedQuestions } from "../utils/pyqQuestions.js";

const formatTopics = (topics) => topics
  .slice(0, GENAI_LIMITS.MAX_TOPICS)
  .map((item, idx) => `${idx + 1}. ${item.name} (weight: ${item.weight.toFixed(3)})`)
  .join("\n");

const fallbackInsights = (topics, questionCount) => ({
  expectedQuestions: Array.from({ length: questionCount }, (_, i) => {
    const topic = topics[i % topics.length];
    return `Q${i + 1}: Explain core concepts and exam patterns of ${topic.name}.`;
  }),
  revisionPlan: "Last day: revise top 5 topics first, solve 2 timed mixed sets, and end with formula/concept flash review."
});

const parseResponseText = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    return JSON.parse(match[0]);
  } catch (_error) {
    return null;
  }
};

export const generateInsights = async ({
  topics,
  questionCount = GENAI_LIMITS.DEFAULT_QUESTION_COUNT,
  questionPapers,
  workflow
}) => {
  if (workflow === "pyq" && questionPapers?.length) {
    const extracted = extractRepeatedQuestions(questionPapers, questionCount);

    return {
      expectedQuestions: extracted.questions,
      revisionPlan: buildPyqRevisionPlan(extracted.questions),
      evidence: {
        repeatedQuestionCount: extracted.repeatedQuestionCount,
        totalQuestionCandidates: extracted.totalQuestionCandidates
      }
    };
  }

  if (!topics?.length) {
    return { expectedQuestions: [], revisionPlan: "" };
  }

  if (!appConfig.openAiApiKey) {
    return fallbackInsights(topics, questionCount);
  }

  const formattedTopics = formatTopics(topics);

  let data;

  try {
    ({ data } = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: appConfig.openAiModel,
      messages: [
        { role: "system", content: GENAI_PROMPTS.SYSTEM },
        { role: "user", content: `${GENAI_PROMPTS.USER_TEMPLATE(formattedTopics, questionCount)}\n\nReturn strict JSON:\n${GENAI_RESPONSE_TEMPLATE}` }
      ],
      max_tokens: GENAI_LIMITS.MAX_OUTPUT_TOKENS,
      temperature: 0.4
    }, {
      headers: {
        Authorization: `Bearer ${appConfig.openAiApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }));
  } catch (_error) {
    return fallbackInsights(topics, questionCount);
  }

  const content = data.choices?.[0]?.message?.content || "";
  const parsed = parseResponseText(content);

  if (!parsed) {
    return fallbackInsights(topics, questionCount);
  }

  return {
    expectedQuestions: Array.isArray(parsed.expectedQuestions) ? parsed.expectedQuestions.slice(0, questionCount) : [],
    revisionPlan: typeof parsed.revisionPlan === "string" ? parsed.revisionPlan : ""
  };
};
