import express from "express";
import { corsMiddleware } from "../middlewares/cors";
import { errorHandler, notFoundHandler } from "../middlewares/error-handler";
import { requestLogger } from "../middlewares/request-logger";
import { apiKeyRouter } from "../routes/api_key_routes";
import { authRouter } from "../routes/auth_routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestLogger);
  app.use(corsMiddleware);
  app.use(express.json());
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/api-keys", apiKeyRouter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
