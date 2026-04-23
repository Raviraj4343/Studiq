import axios from "axios";

import { API_ENDPOINTS } from "../constants/app.constants.js";

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json"
  }
});

const unwrap = async (requestPromise) => {
  const { data } = await requestPromise;
  return data.data;
};

export const analyzePrep = (payload) => unwrap(apiClient.post(API_ENDPOINTS.ANALYZE, payload));

export const fetchPlaylist = (payload) => unwrap(apiClient.post(API_ENDPOINTS.PLAYLIST, payload));

export const fetchInsights = (payload) => unwrap(apiClient.post(API_ENDPOINTS.GENAI_INSIGHTS, payload));
