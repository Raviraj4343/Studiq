import { appConfig } from "../config/env.js";

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || "Internal server error"
  };

  if (err.meta) {
    payload.meta = err.meta;
  }

  if (!appConfig.isProd && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
