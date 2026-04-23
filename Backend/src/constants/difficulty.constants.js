export const DIFFICULTY_LEVELS = {
  easy: {
    rankWeight: 1,
    maxTopicsMultiplier: 0.7,
    maxVideosPerTopic: 2,
    label: "Foundation-first"
  },
  medium: {
    rankWeight: 1.1,
    maxTopicsMultiplier: 1,
    maxVideosPerTopic: 3,
    label: "Balanced progression"
  },
  hard: {
    rankWeight: 1.25,
    maxTopicsMultiplier: 1.2,
    maxVideosPerTopic: 4,
    label: "High-intensity coverage"
  }
};

export const DEFAULT_DIFFICULTY = "medium";

export const SUBJECT_TYPES = {
  THEORY: "theory",
  PROBLEM: "problem"
};

export const SUBJECT_KEYWORDS = {
  theory: [
    "history",
    "biology",
    "political",
    "law",
    "sociology",
    "theory",
    "literature",
    "philosophy",
    "economics",
    "geography"
  ],
  problem: [
    "math",
    "algorithm",
    "numerical",
    "physics",
    "chemistry",
    "coding",
    "programming",
    "equation",
    "calculus",
    "statistics",
    "accounting"
  ]
};

export const STUDY_ORDER_BY_SUBJECT = {
  theory: {
    easy: {
      primaryFocus: "concepts",
      strategy: "Start with core concepts, then move into short-answer recall practice."
    },
    medium: {
      primaryFocus: "concepts",
      strategy: "Understand concept clusters first, then revise recurring exam themes."
    },
    hard: {
      primaryFocus: "concepts",
      strategy: "Master core concepts first, then pressure-test with inference-heavy questions."
    }
  },
  problem: {
    easy: {
      primaryFocus: "examples",
      strategy: "Begin with worked examples, then solve direct practice problems."
    },
    medium: {
      primaryFocus: "examples",
      strategy: "Review representative examples first, then shift into mixed drills."
    },
    hard: {
      primaryFocus: "examples",
      strategy: "Study advanced examples first, then run timed problem-solving rounds."
    }
  }
};
