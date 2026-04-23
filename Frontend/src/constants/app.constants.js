export const API_ENDPOINTS = {
  ANALYZE: "/api/analyze",
  PLAYLIST: "/api/playlist",
  GENAI_INSIGHTS: "/api/genai/insights"
};

export const INPUT_MODES = [
  { id: "text", label: "Syllabus" },
  { id: "topics", label: "Topic List" },
  { id: "pdf", label: "PDF Upload" }
];

export const DIFFICULTY_OPTIONS = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" }
];

export const SESSION_KEYS = {
  RESULTS: "studiq.latestResults",
  THEME: "studiq.theme"
};
