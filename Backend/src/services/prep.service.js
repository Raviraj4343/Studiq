import { appConfig } from "../config/env.js";
import { APP_LIMITS } from "../constants/app.constants.js";
import { analyzeInputWithML } from "./ml.service.js";
import { applyDifficultyProfile, detectSubjectType } from "./difficulty.service.js";
import { StudySession } from "../models/mongo/studySession.model.js";

export const mergeInput = ({ syllabus, topics, questionPapers }) => {
  const textParts = [];

  if (syllabus) {
    textParts.push(syllabus);
  }
  if (topics?.length) {
    textParts.push(topics.join("\n"));
  }
  if (questionPapers?.length) {
    textParts.push(questionPapers.join("\n\n"));
  }

  return textParts.join("\n\n");
};

const roundValue = (value) => Number(value.toFixed(APP_LIMITS.CHART_DECIMALS));

const normalizeTopics = (topics) => {
  const maxScore = Math.max(...topics.map((topic) => topic.adjustedScore || topic.score), 1);

  return topics.map((topic) => ({
    ...topic,
    weight: roundValue((topic.adjustedScore || topic.score) / maxScore)
  }));
};

const buildChartData = (topics) => {
  const normalizedTopics = normalizeTopics(topics);
  const totalWeight = normalizedTopics.reduce((sum, topic) => sum + topic.weight, 0) || 1;
  let runningTotal = 0;

  return {
    labels: normalizedTopics.map((topic) => topic.name),
    values: normalizedTopics.map((topic) => topic.weight),
    topTopics: normalizedTopics.slice(0, APP_LIMITS.MAX_TOP_TOPICS).map((topic) => topic.name),
    cumulativeImportance: normalizedTopics.map((topic) => {
      runningTotal += topic.weight;
      return roundValue(runningTotal / totalWeight);
    })
  };
};

const persistStudySession = async (payload) => {
  try {
    await StudySession.create(payload);
  } catch (_error) {
    // Persistence is optional for local development.
  }
};

export const generateStudyPlan = async (payload) => {
  const inputText = mergeInput(payload);
  const subjectType = detectSubjectType(inputText);
  const requestedTopK = Number.isInteger(payload.topK) ? payload.topK : appConfig.topicLimit;
  const mlResult = await analyzeInputWithML({
    text: inputText,
    topK: requestedTopK
  });

  const { profile, topics } = applyDifficultyProfile(mlResult.topics, payload.difficulty, subjectType);
  const weightedTopics = normalizeTopics(topics);

  return {
    summary: {
      difficulty: payload.difficulty,
      strategy: profile.strategy,
      totalTopics: weightedTopics.length,
      subjectType,
      primaryFocus: profile.primaryFocus
    },
    mostImportantTopics: weightedTopics,
    chartData: buildChartData(weightedTopics)
  };
};

export const saveStudySession = async (payload) => {
  await persistStudySession(payload);
};
