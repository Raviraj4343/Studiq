import { Router } from "express";

import { analyzePreparation, generateGenAiInsights, generatePlaylist } from "../controllers/prep.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { prepRequestSchema } from "../models/prepRequest.model.js";
import { insightsRequestSchema, playlistRequestSchema } from "../models/insightsRequest.model.js";

const router = Router();

router.post("/analyze", validateBody(prepRequestSchema), analyzePreparation);
router.post("/playlist", validateBody(playlistRequestSchema), generatePlaylist);
router.post("/genai/insights", validateBody(insightsRequestSchema), generateGenAiInsights);

export default router;
