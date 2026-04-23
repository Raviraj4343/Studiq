import axios from "axios";

import { appConfig } from "../config/env.js";
import {
  YOUTUBE_API,
  YOUTUBE_QUERY_SUFFIX,
  VIDEO_DURATION_PREFERENCE,
  VIDEO_SCORE_WEIGHTS,
  YOUTUBE_RANKING
} from "../constants/youtube.constants.js";

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

const scoreRelevance = (topic, video) => {
  const topicTokens = topic.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${video.title} ${video.description}`.toLowerCase();
  const matches = topicTokens.filter((token) => haystack.includes(token)).length;
  const baseScore = topicTokens.length ? matches / topicTokens.length : 0;
  const durationBonus = video.durationMinutes >= VIDEO_DURATION_PREFERENCE.minMinutes &&
    video.durationMinutes <= VIDEO_DURATION_PREFERENCE.maxMinutes ? 1 : 0.4;

  return Number((baseScore * 0.8 + durationBonus * 0.2).toFixed(3));
};

const dedupeVideos = (videos) => {
  const seen = new Set();

  return videos.filter((video) => {
    const titleKey = video.title.toLowerCase().slice(0, YOUTUBE_RANKING.duplicateTitleLength);
    const key = `${video.videoId}:${titleKey}`;

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
    const { data } = await axios.get(YOUTUBE_API.SEARCH_URL, {
      params: {
        key: appConfig.youtubeApiKey,
        part: "snippet",
        q: `${topic} ${YOUTUBE_QUERY_SUFFIX}`,
        type: "video",
        maxResults: Math.min(maxResults * YOUTUBE_RANKING.searchResultMultiplier, 10),
        videoEmbeddable: true,
        safeSearch: "strict"
      },
      timeout: 12000
    });

    const searchItems = data.items || [];
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

    const uniqueVideos = dedupeVideos(rawVideos);
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
