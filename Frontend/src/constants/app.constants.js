export const API_ENDPOINTS = {
  ANALYZE: "/api/analyze",
  PLAYLIST: "/api/playlist",
  GENAI_INSIGHTS: "/api/genai/insights"
};

export const DEFAULT_PLAYLIST_SIZE = 3;
export const DEFAULT_QUESTION_COUNT = 10;

export const WORKFLOW_OPTIONS = [
  {
    id: "pyq",
    label: "PYQ Analysis",
    description: "Upload previous year questions and get the most expected questions."
  },
  {
    id: "syllabus",
    label: "Syllabus to Playlist",
    description: "Upload a syllabus image or PDF and build a YouTube plan."
  },
  {
    id: "topics",
    label: "Topic Playlist",
    description: "Enter topic names and get a playlist fast."
  }
];

export const DIFFICULTY_OPTIONS = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" }
];

export const DIFFICULTY_PLAYLIST_SIZE = {
  easy: 2,
  medium: 3,
  hard: 4
};

export const SESSION_KEYS = {
  RESULTS: "studiq.latestResults",
  THEME: "studiq.theme"
};
