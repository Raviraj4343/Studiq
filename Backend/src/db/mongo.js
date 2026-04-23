import mongoose from "mongoose";

import { appConfig } from "../config/env.js";

export const connectMongo = async () => {
  if (!appConfig.mongoUri) {
    console.warn("MONGODB_URI not set, running without persistence");
    return;
  }

  await mongoose.connect(appConfig.mongoUri);
  console.log("MongoDB connected");
};
