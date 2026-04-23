import axios from "axios";

import { appConfig } from "../config/env.js";
import {
  YOUTUBE_API,
  YOUTUBE_QUERY_SUFFIX,
  VIDEO_DURATION_PREFERENCE,
  VIDEO_SCORE_WEIGHTS,
  YOUTUBE_RANKING
} from "../constants/youtube.constants.js";

const TOPIC_TOKEN_STOPWORDS = new Set([
  "and", "for", "with", "the", "from", "into", "using", "based", "introduction", "intro"
]);

const normalizeTopicName = (topic) => topic
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const tokenizeTopic = (topic) => normalizeTopicName(topic)
  .split(" ")
  .map((token) => token.trim())
  .filter((token) => token && token.length >= 3 && !TOPIC_TOKEN_STOPWORDS.has(token));

const buildTopicQueries = (topic) => {
  const normalized = normalizeTopicName(topic);
  if (!normalized) {
    return [`${topic} ${YOUTUBE_QUERY_SUFFIX}`];
  }

  const canonicalTopic = normalized
    .split(" ")
    .filter((token) => token.length >= 3)
    .slice(0, 8)
    .join(" ");
  const queryTopic = canonicalTopic || normalized;

  const queries = [
    `"${queryTopic}" ${YOUTUBE_QUERY_SUFFIX}`,
    `${queryTopic} complete lecture exam prep`
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
    tokenCoverage: uniqueMatchedTokens / tokens.length,
    titleCoverage: titleMatches / tokens.length,
    descriptionCoverage: descriptionMatches / tokens.length
  };
};

const isTopicRelevant = (topic, video) => {
  const tokens = tokenizeTopic(topic);
  const coverage = computeTopicCoverage(topic, video);

  if (coverage.exactPhraseMatch) {
    return true;
  }

  if (!tokens.length) {
    return false;
  }

  if (tokens.length === 1) {
    return coverage.titleCoverage >= 1 || coverage.descriptionCoverage >= 1;
  }

  return coverage.titleCoverage >= 0.5 || coverage.tokenCoverage >= 0.6;
};

const scoreRelevance = (topic, video) => {
  const {
    exactPhraseMatch,
    tokenCoverage,
    titleCoverage,
    descriptionCoverage
  } = computeTopicCoverage(topic, video);
  const baseScore = (
    titleCoverage * 0.55 +
    descriptionCoverage * 0.2 +
    tokenCoverage * 0.15 +
    (exactPhraseMatch ? 0.1 : 0)
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

const fallbackVideo = (topic) => ({
  title: `${topic} - Suggested learning search`,
  channelTitle: "YouTube Search",
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " " + YOUTUBE_QUERY_SUFFIX)}`,
  duration: "Search",
  durationMinutes: 0,
  views: 0,
  likes: 0,
  relevance: 0.5,
  score: 0.5,
  topicTag: topic
});

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

export const getVideosForTopic = async (topic, maxResults) => {
  if (!appConfig.youtubeApiKey) {
    return [fallbackVideo(topic)];
  }

  try {
    const searchQueries = buildTopicQueries(topic);
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

    const uniqueVideos = dedupeVideos(rawVideos).filter((video) => isTopicRelevant(topic, video));
    if (!uniqueVideos.length) {
      return [fallbackVideo(topic)];
    }

    const maxViews = Math.max(...uniqueVideos.map((video) => video.views), 0);
    const maxLikes = Math.max(...uniqueVideos.map((video) => video.likes), 0);

    return uniqueVideos
      .map((video) => {
        const relevance = scoreRelevance(topic, video);
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
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  } catch (_error) {
    return [fallbackVideo(topic)];
  }
};

export const buildPlaylist = async (topics, maxVideosPerTopic) => {
  const safeMaxVideosPerTopic = Number.isInteger(maxVideosPerTopic) && maxVideosPerTopic > 0
    ? maxVideosPerTopic
    : appConfig.youtubeMaxResults;

  const playlist = await Promise.all(topics.map(async (topic) => ({
    topic: topic.name,
    topicWeight: topic.weight ?? topic.adjustedScore ?? topic.score ?? 0,
    videos: await getVideosForTopic(topic.name, safeMaxVideosPerTopic)
  })));

  return playlist.sort((a, b) => b.topicWeight - a.topicWeight);
};
