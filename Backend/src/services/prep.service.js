import { appConfig } from "../config/env.js";
import { APP_LIMITS } from "../constants/app.constants.js";
import { analyzeInputWithML } from "./ml.service.js";
import { applyDifficultyProfile, detectSubjectType } from "./difficulty.service.js";
import { StudySession } from "../models/mongo/studySession.model.js";

const MIN_ML_INPUT_LENGTH = 3;

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

const normalizeTopicName = (value) => value
  .trim()
  .replace(/\s+/g, " ");

const buildFallbackTopics = (topics = []) => {
  const normalizedTopics = [...new Set(
    topics
      .map((topic) => normalizeTopicName(String(topic || "")))
      .filter((topic) => topic.length >= APP_LIMITS.MIN_TOPIC_NAME_LENGTH)
  )];

  if (!normalizedTopics.length) {
    return [];
  }

  const maxRank = Math.max(normalizedTopics.length - 1, 1);

  return normalizedTopics.map((name, index) => {
    const score = roundValue(Math.max(1 - (index / maxRank) * 0.35, 0.65));

    return {
      name,
      frequency: 1,
      score,
      adjustedScore: score,
      priority: index < 2 ? "high" : index < 5 ? "medium" : "low"
    };
  });
};

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
  const directTopics = buildFallbackTopics(payload.topics);
  const canUseMl = inputText.trim().length >= MIN_ML_INPUT_LENGTH;

  let rankedTopics = directTopics;

  if (canUseMl) {
    try {
      const mlResult = await analyzeInputWithML({
        text: inputText,
        topK: requestedTopK
      });

      rankedTopics = mlResult.topics?.length ? mlResult.topics : directTopics;
    } catch (error) {
      if (!directTopics.length) {
        throw error;
      }
    }
  }

  const { profile, topics } = applyDifficultyProfile(rankedTopics, payload.difficulty, subjectType);
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
