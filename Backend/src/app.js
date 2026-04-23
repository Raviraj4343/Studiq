import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { appConfig } from "./config/env.js";
import prepRoutes from "./routes/prep.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { API_ROUTES } from "./constants/app.constants.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(appConfig.isProd ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "studiq-backend"
  });
});

app.use(API_ROUTES.API_BASE, prepRoutes);
app.use(API_ROUTES.LEGACY_PREP_BASE, prepRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
