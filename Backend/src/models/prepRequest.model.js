import { z } from "zod";

import { API_LIMITS } from "../constants/api.constants.js";
import { DEFAULT_DIFFICULTY } from "../constants/difficulty.constants.js";
import { DIFFICULTY_OPTIONS } from "../constants/app.constants.js";

export const prepRequestSchema = z.object({
  syllabus: z.string().trim().max(API_LIMITS.INPUT_MAX_CHARS).optional(),
  topics: z.array(z.string().trim().min(API_LIMITS.MIN_TOPIC_NAME_LENGTH)).optional(),
  questionPapers: z.array(z.string().trim().max(API_LIMITS.INPUT_MAX_CHARS)).optional(),
  difficulty: z.enum(DIFFICULTY_OPTIONS).default(DEFAULT_DIFFICULTY)
}).superRefine((data, ctx) => {
  const hasAnyInput = Boolean(data.syllabus) || Boolean(data.topics?.length) || Boolean(data.questionPapers?.length);

  if (!hasAnyInput) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide at least one of syllabus, topics, or questionPapers"
    });
  }
});

export const validatePrepRequest = (payload) => prepRequestSchema.parse(payload);
