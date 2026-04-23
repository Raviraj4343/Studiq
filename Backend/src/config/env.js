import { z } from "zod";
import { APP_LIMITS } from "../constants/app.constants.js";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  ML_SERVICE_URL: z.string().url().default("http://localhost:8000"),
  MONGODB_URI: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  YOUTUBE_MAX_RESULTS: z.coerce.number().int().min(1).max(10).default(3),
  TOPIC_LIMIT: z.coerce.number().int().min(3).max(APP_LIMITS.MAX_TOPIC_LIMIT).default(APP_LIMITS.DEFAULT_TOPIC_LIMIT),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const appConfig = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  mlServiceUrl: parsed.data.ML_SERVICE_URL,
  mongoUri: parsed.data.MONGODB_URI,
  youtubeApiKey: parsed.data.YOUTUBE_API_KEY,
  youtubeMaxResults: parsed.data.YOUTUBE_MAX_RESULTS,
  topicLimit: parsed.data.TOPIC_LIMIT,
  openAiApiKey: parsed.data.OPENAI_API_KEY,
  openAiModel: parsed.data.OPENAI_MODEL,
  isProd: parsed.data.NODE_ENV === "production"
};
