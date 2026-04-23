import { ZodError } from "zod";

import { AppError } from "../utils/AppError.js";

export const validateBody = (schema) => (req, _res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(new AppError("Validation failed", 400, error.flatten().fieldErrors));
    }
    return next(error);
  }
};
