import dotenv from "dotenv";
import { getPrismaClient } from "../lib/prisma";
import { getRedisClient } from "../lib/redis";
import { createApp } from "./app";
import { logger } from "../utils/logger";

dotenv.config();

const app = createApp();

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  logger.info("Backend server started", {
    port,
    environment: process.env.NODE_ENV ?? "development",
  });
});

async function shutdown(signal: string) {
  logger.info("Shutdown signal received", { signal });

  try {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
  } catch (error) {
    logger.error("Failed to disconnect Prisma cleanly", {
      message: error instanceof Error ? error.message : "Unknown Prisma error",
    });
  }

  try {
    const redis = await getRedisClient();
    if (redis.isOpen) {
      await redis.quit();
    }
  } catch (error) {
    logger.error("Failed to disconnect Redis cleanly", {
      message: error instanceof Error ? error.message : "Unknown Redis error",
    });
  }

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
