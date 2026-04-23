import { asyncHandler } from "../utils/asyncHandler.js";
import { generateStudyPlan } from "../services/prep.service.js";
import { buildPlaylist } from "../services/youtube.service.js";
import { generateInsights } from "../services/genai.service.js";

export const analyzePreparation = asyncHandler(async (req, res) => {
  const result = await generateStudyPlan(req.validatedBody);

  res.status(200).json({
    success: true,
    data: result
  });
});

export const generatePlaylist = asyncHandler(async (req, res) => {
  const result = await buildPlaylist(req.validatedBody.topics, req.validatedBody.maxVideosPerTopic);

  res.status(200).json({
    success: true,
    data: result
  });
});

export const generateGenAiInsights = asyncHandler(async (req, res) => {
  const result = await generateInsights(req.validatedBody);

  res.status(200).json({
    success: true,
    data: result
  });
});
