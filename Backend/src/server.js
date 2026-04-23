import "dotenv/config";
import app from "./app.js";
import { appConfig } from "./config/env.js";
import { connectMongo } from "./db/mongo.js";

connectMongo()
  .catch((error) => {
    console.error("MongoDB connection failed", error.message);
  })
  .finally(() => {
    app.listen(appConfig.port, () => {
      console.log(`Backend running on http://localhost:${appConfig.port}`);
    });
  });
