import axios from "axios";

import { appConfig } from "../config/env.js";
import { EXTERNAL_ENDPOINTS } from "../constants/api.constants.js";
import { AppError } from "../utils/AppError.js";

const mlClient = axios.create({
  baseURL: appConfig.mlServiceUrl,
  timeout: 15000
});

export const analyzeInputWithML = async (payload) => {
  try {
    const { data } = await mlClient.post(EXTERNAL_ENDPOINTS.ML_ANALYZE, payload);
    return data;
  } catch (error) {
    const statusCode = error.response?.status || 502;
    const message = error.response?.data?.detail || "ML service unavailable";
    throw new AppError(message, statusCode);
  }
};
