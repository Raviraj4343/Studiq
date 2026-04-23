import { appConfig } from "../config/env.js";
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_LEVELS,
  SUBJECT_KEYWORDS,
  SUBJECT_TYPES,
  STUDY_ORDER_BY_SUBJECT
} from "../constants/difficulty.constants.js";

const scoreSubjectKeywords = (text, keywords) =>
  keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);

export const detectSubjectType = (input = "") => {
  const normalized = input.toLowerCase();
  const theoryScore = scoreSubjectKeywords(normalized, SUBJECT_KEYWORDS.theory);
  const problemScore = scoreSubjectKeywords(normalized, SUBJECT_KEYWORDS.problem);

  if (problemScore > theoryScore) {
    return SUBJECT_TYPES.PROBLEM;
  }

  return SUBJECT_TYPES.THEORY;
};

export const applyDifficultyProfile = (rankedTopics, difficulty = DEFAULT_DIFFICULTY, subjectType = SUBJECT_TYPES.THEORY) => {
  const profile = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS[DEFAULT_DIFFICULTY];
  const subjectProfile = STUDY_ORDER_BY_SUBJECT[subjectType]?.[difficulty] || STUDY_ORDER_BY_SUBJECT[SUBJECT_TYPES.THEORY][DEFAULT_DIFFICULTY];
  const totalTopics = Math.max(1, Math.floor(appConfig.topicLimit * profile.maxTopicsMultiplier));

  const adjusted = rankedTopics
    .map((topic) => ({
      ...topic,
      adjustedScore: Number((topic.score * profile.rankWeight).toFixed(3)),
      studyFocus: subjectProfile.primaryFocus
    }))
    .sort((a, b) => b.adjustedScore - a.adjustedScore)
    .slice(0, totalTopics);

  return {
    profile: {
      ...profile,
      primaryFocus: subjectProfile.primaryFocus,
      strategy: subjectProfile.strategy
    },
    topics: adjusted
  };
};
