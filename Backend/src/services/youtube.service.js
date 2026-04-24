import axios from "axios";

import { appConfig } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import {
  YOUTUBE_API,
  YOUTUBE_QUERY_SUFFIX,
  VIDEO_DURATION_PREFERENCE,
  VIDEO_SCORE_WEIGHTS,
  YOUTUBE_RANKING
} from "../constants/youtube.constants.js";

const TOPIC_TOKEN_STOPWORDS = new Set([
  "and", "for", "with", "the", "from", "into", "using", "based", "introduction", "intro", "unit", "module", "chapter"
]);

const NON_EDUCATIONAL_KEYWORDS = [
  "shorts",
  "short",
  "song",
  "music",
  "lyrics",
  "movie",
  "trailer",
  "reaction",
  "meme",
  "status",
  "vlog",
  "podcast",
  "gaming",
  "gameplay",
  "edit",
  "fanmade",
  "motivation",
  "motivational",
  "interview",
  "news",
  "web series"
];

const EDUCATIONAL_HINTS = [
  "lecture",
  "tutorial",
  "explained",
  "course",
  "class",
  "training",
  "lesson",
  "problem",
  "questions",
  "exam",
  "university",
  "college"
];

const MIN_RELEVANCE_SCORE = 0.62;

const normalizeTopicName = (topic) => topic
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const tokenizeTopic = (topic) => normalizeTopicName(topic)
  .split(" ")
  .map((token) => token.trim())
  .filter((token) => token && token.length >= 3 && !TOPIC_TOKEN_STOPWORDS.has(token));

const getTopicAcronym = (topic) => {
  const tokens = normalizeTopicName(topic).split(" ").filter(Boolean);
  if (!tokens.length) {
    return "";
  }

  if (tokens.length === 1 && /^[a-z0-9]+$/i.test(tokens[0])) {
    return tokens[0];
  }

  return tokens.map((token) => token[0]).join("");
};

const tokenizeSubjectName = (subjectName) => normalizeSubjectName(subjectName)
  .split(" ")
  .filter((token) => token.length >= 3 && !TOPIC_TOKEN_STOPWORDS.has(token));

const normalizeSubjectName = (subjectName) => (subjectName || "")
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const buildExactSearchUrl = (topic, subjectName) => {
  const normalizedSubject = normalizeSubjectName(subjectName);
  const searchQuery = [`"${topic}"`, normalizedSubject, "lecture tutorial"]
    .filter(Boolean)
    .join(" ");

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
};

const buildFallbackSearchVideo = (topic, subjectName, reason = "search") => ({
  videoId: "",
  title: `${topic} - Exact topic search`,
  description: `Fallback ${reason} result for exact topic lookup.`,
  channelTitle: "YouTube Search",
  url: buildExactSearchUrl(topic, subjectName),
  duration: "Search",
  durationMinutes: 0,
  views: 0,
  likes: 0,
  topicTag: topic,
  relevance: 1,
  score: 0.5,
  isFallbackSearch: true
});

const buildTopicQueries = (topic, subjectName) => {
  const normalized = normalizeTopicName(topic);
  const normalizedSubject = normalizeSubjectName(subjectName);

  if (!normalized) {
    return [`${topic} ${normalizedSubject} ${YOUTUBE_QUERY_SUFFIX}`.trim()];
  }

  const canonicalTopic = normalized
    .split(" ")
    .filter((token) => token.length >= 3)
    .slice(0, 8)
    .join(" ");
  const queryTopic = canonicalTopic || normalized;
  const withSubject = normalizedSubject ? `${queryTopic} ${normalizedSubject}` : queryTopic;

  const queries = [
    `"${queryTopic}" ${normalizedSubject} lecture tutorial`.trim(),
    `${withSubject} exam lecture tutorial solved`.trim(),
    `${withSubject} university lecture`.trim(),
    `${withSubject} ${YOUTUBE_QUERY_SUFFIX}`.trim()
  ];

  return [...new Set(queries)];
};

const parseDurationToMinutes = (duration) => {
  const match = duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return 0;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return Math.round(((hours * 3600) + (minutes * 60) + seconds) / 60);
};

const normalizeMetric = (value, maxValue) => {
  if (!maxValue) {
    return 0;
  }

  return value / maxValue;
};

const computeTopicCoverage = (topic, video) => {
  const tokens = tokenizeTopic(topic);
  const normalizedTopic = normalizeTopicName(topic);
  const acronym = getTopicAcronym(topic);
  const title = (video.title || "").toLowerCase();
  const description = (video.description || "").toLowerCase();
  const haystack = `${title} ${description}`;

  if (!tokens.length) {
    return {
      exactPhraseMatch: normalizedTopic.length >= 3 && haystack.includes(normalizedTopic),
      tokenCoverage: 0,
      titleCoverage: 0,
      descriptionCoverage: 0
    };
  }

  const titleMatches = tokens.filter((token) => title.includes(token)).length;
  const descriptionMatches = tokens.filter((token) => description.includes(token)).length;
  const uniqueMatchedTokens = tokens.filter((token) => haystack.includes(token)).length;

  return {
    exactPhraseMatch: normalizedTopic.length >= 3 && haystack.includes(normalizedTopic),
    exactTitleMatch: normalizedTopic.length >= 3 && title.includes(normalizedTopic),
    acronymTitleMatch: acronym.length >= 2 && new RegExp(`(^|\\W)${acronym.toLowerCase()}(\\W|$)`).test(title),
    tokenCoverage: uniqueMatchedTokens / tokens.length,
    titleCoverage: titleMatches / tokens.length,
    descriptionCoverage: descriptionMatches / tokens.length
  };
};

const computeSubjectCoverage = (subjectName, video) => {
  const tokens = tokenizeSubjectName(subjectName);
  if (!tokens.length) {
    return 0;
  }

  const haystack = `${(video.title || "").toLowerCase()} ${(video.description || "").toLowerCase()}`;
  const matches = tokens.filter((token) => haystack.includes(token)).length;

  return matches / tokens.length;
};

const hasNonEducationalSignals = (video) => {
  const haystack = `${(video.title || "").toLowerCase()} ${(video.description || "").toLowerCase()}`;
  return NON_EDUCATIONAL_KEYWORDS.some((keyword) => haystack.includes(keyword));
};

const hasEducationalSignals = (video) => {
  const haystack = `${(video.title || "").toLowerCase()} ${(video.description || "").toLowerCase()}`;
  return EDUCATIONAL_HINTS.some((keyword) => haystack.includes(keyword));
};

const isTopicRelevant = (topic, video, subjectName) => {
  const tokens = tokenizeTopic(topic);
  const coverage = computeTopicCoverage(topic, video);
  const subjectCoverage = computeSubjectCoverage(subjectName, video);
  const hasSubject = tokenizeSubjectName(subjectName).length > 0;

  if (hasNonEducationalSignals(video)) {
    return false;
  }

  if ((coverage.exactTitleMatch || coverage.acronymTitleMatch) && (!hasSubject || subjectCoverage >= 0.2 || hasEducationalSignals(video))) {
    return true;
  }

  if (coverage.exactPhraseMatch && (!hasSubject || subjectCoverage >= 0.34 || hasEducationalSignals(video))) {
    return true;
  }

  if (!tokens.length) {
    return false;
  }

  if (tokens.length === 1) {
    return coverage.titleCoverage >= 1 && (!hasSubject || subjectCoverage >= 0.34 || hasEducationalSignals(video));
  }

  return (
    (coverage.titleCoverage >= 0.75 && (!hasSubject || subjectCoverage >= 0.2 || hasEducationalSignals(video))) ||
    (coverage.titleCoverage >= 0.5 && coverage.tokenCoverage >= 0.8 && (!hasSubject || subjectCoverage >= 0.34 || hasEducationalSignals(video))) ||
    (coverage.tokenCoverage >= 0.85 && (!hasSubject || subjectCoverage >= 0.34 || hasEducationalSignals(video)))
  );
};

const scoreRelevance = (topic, video, subjectName) => {
  const {
    exactPhraseMatch,
    exactTitleMatch,
    acronymTitleMatch,
    tokenCoverage,
    titleCoverage,
    descriptionCoverage
  } = computeTopicCoverage(topic, video);
  const subjectCoverage = computeSubjectCoverage(subjectName, video);
  const educationalSignal = hasEducationalSignals(video) ? 1 : 0;
  const baseScore = (
    titleCoverage * 0.45 +
    descriptionCoverage * 0.08 +
    tokenCoverage * 0.2 +
    subjectCoverage * 0.12 +
    (exactPhraseMatch ? 0.05 : 0) +
    (exactTitleMatch ? 0.07 : 0) +
    (acronymTitleMatch ? 0.05 : 0) +
    educationalSignal * 0.03
  );
  const durationBonus = video.durationMinutes >= VIDEO_DURATION_PREFERENCE.minMinutes &&
    video.durationMinutes <= VIDEO_DURATION_PREFERENCE.maxMinutes ? 1 : 0.4;

  return Number((baseScore * 0.9 + durationBonus * 0.1).toFixed(3));
};

const dedupeVideos = (videos) => {
  const seen = new Set();

  return videos.filter((video) => {
    const titleKey = (video.title || "").toLowerCase().slice(0, YOUTUBE_RANKING.duplicateTitleLength);
    const key = video.videoId || `${titleKey}:${video.channelTitle}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const searchYouTubeVideos = async (query, maxResults) => {
  const { data } = await axios.get(YOUTUBE_API.SEARCH_URL, {
    params: {
      key: appConfig.youtubeApiKey,
      part: "snippet",
      q: query,
      type: "video",
      maxResults: Math.min(maxResults * YOUTUBE_RANKING.searchResultMultiplier, 10),
      videoEmbeddable: true,
      safeSearch: "strict"
    },
    timeout: 12000
  });

  return data.items || [];
};

const fetchVideoDetails = async (videoIds) => {
  if (!videoIds.length) {
    return [];
  }

  const { data } = await axios.get(YOUTUBE_API.VIDEO_DETAILS_URL, {
    params: {
      key: appConfig.youtubeApiKey,
      part: "contentDetails,statistics",
      id: videoIds.join(",")
    },
    timeout: 12000
  });

  return data.items || [];
};

export const getVideosForTopic = async (topic, maxResults, subjectName) => {
  if (!appConfig.youtubeApiKey) {
    return [buildFallbackSearchVideo(topic, subjectName, "missing-api-key")];
  }

  try {
    const searchQueries = buildTopicQueries(topic, subjectName);
    const searchResponses = await Promise.all(
      searchQueries.map((query) => searchYouTubeVideos(query, maxResults))
    );
    const searchItems = searchResponses.flat();
    const videoIds = searchItems.map((item) => item.id.videoId).filter(Boolean);
    const details = await fetchVideoDetails(videoIds);
    const detailsMap = new Map(details.map((item) => [item.id, item]));
    const rawVideos = searchItems.map((item) => {
      const detail = detailsMap.get(item.id.videoId);
      const durationMinutes = parseDurationToMinutes(detail?.contentDetails?.duration);

      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description || "",
        channelTitle: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        duration: detail?.contentDetails?.duration || "PT0M",
        durationMinutes,
        views: Number(detail?.statistics?.viewCount || 0),
        likes: Number(detail?.statistics?.likeCount || 0),
        topicTag: topic
      };
    });

    const uniqueVideos = dedupeVideos(rawVideos).filter((video) => isTopicRelevant(topic, video, subjectName));
    if (!uniqueVideos.length) {
      return [buildFallbackSearchVideo(topic, subjectName, "no-strong-match")];
    }

    const maxViews = Math.max(...uniqueVideos.map((video) => video.views), 0);
    const maxLikes = Math.max(...uniqueVideos.map((video) => video.likes), 0);

    const rankedVideos = uniqueVideos
      .map((video) => {
        const relevance = scoreRelevance(topic, video, subjectName);
        const score = (
          normalizeMetric(video.views, maxViews) * VIDEO_SCORE_WEIGHTS.views +
          normalizeMetric(video.likes, maxLikes) * VIDEO_SCORE_WEIGHTS.likes +
          relevance * VIDEO_SCORE_WEIGHTS.relevance
        );

        return {
          ...video,
          relevance: Number(relevance.toFixed(3)),
          score: Number(score.toFixed(3))
        };
      })
      .filter((video) => video.relevance >= MIN_RELEVANCE_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return rankedVideos.length
      ? rankedVideos
      : [buildFallbackSearchVideo(topic, subjectName, "low-confidence-match")];
  } catch (error) {
    return [buildFallbackSearchVideo(topic, subjectName, error.response?.status === 403 ? "quota-exceeded" : "network-failure")];
  }
};

export const buildPlaylist = async (topics, maxVideosPerTopic, subjectName) => {
  const safeMaxVideosPerTopic = Number.isInteger(maxVideosPerTopic) && maxVideosPerTopic > 0
    ? maxVideosPerTopic
    : appConfig.youtubeMaxResults;

  const playlist = await Promise.all(topics.map(async (topic) => ({
    topic: topic.name,
    topicWeight: topic.weight ?? topic.adjustedScore ?? topic.score ?? 0,
    videos: await getVideosForTopic(topic.name, safeMaxVideosPerTopic, subjectName)
  })));

  const filteredPlaylist = playlist
    .filter((entry) => Array.isArray(entry.videos) && entry.videos.length > 0)
    .sort((a, b) => b.topicWeight - a.topicWeight);

  return filteredPlaylist;
};
