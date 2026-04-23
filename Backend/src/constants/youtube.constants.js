export const YOUTUBE_API = {
  SEARCH_URL: "https://www.googleapis.com/youtube/v3/search",
  VIDEO_DETAILS_URL: "https://www.googleapis.com/youtube/v3/videos"
};

export const YOUTUBE_QUERY_SUFFIX = "exam preparation lecture";

export const VIDEO_DURATION_PREFERENCE = {
  minMinutes: 10,
  maxMinutes: 40
};

export const VIDEO_SCORE_WEIGHTS = {
  views: 0.5,
  likes: 0.3,
  relevance: 0.2
};

export const YOUTUBE_RANKING = {
  duplicateTitleLength: 48,
  searchResultMultiplier: 2
};
