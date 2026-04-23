import { z } from "zod";

export const insightsRequestSchema = z.object({
  topics: z.array(z.object({
    name: z.string().min(2),
    weight: z.number().min(0).max(1)
  })).min(1)
});

export const playlistRequestSchema = z.object({
  topics: z.array(z.object({
    name: z.string().min(2),
    adjustedScore: z.number().min(0).optional(),
    score: z.number().min(0).optional(),
    weight: z.number().min(0).max(1).optional(),
    priority: z.string().optional()
  })).min(1),
  maxVideosPerTopic: z.number().int().min(1).max(10).optional()
});
