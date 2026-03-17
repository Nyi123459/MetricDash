import express from "express";
import dotenv from "dotenv";
import { getPrismaClient } from "../lib/prisma";
import { getRedisClient } from "../lib/redis";

dotenv.config();

const app = express();

const port = process.env.PORT || 8000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const prisma = getPrismaClient();

    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      status: "error",
      database: "disconnected",
      message: error instanceof Error ? error.message : "Unknown database error",
    });
  }
});

app.get("/health/redis", async (_req, res) => {
  try {
    const redis = await getRedisClient();
    await redis.ping();

    res.status(200).json({
      status: "ok",
      redis: "connected",
    });
  } catch (error) {
    console.error("Redis health check failed:", error);

    res.status(503).json({
      status: "error",
      redis: "disconnected",
      message: error instanceof Error ? error.message : "Unknown Redis error",
    });
  }
});

const server = app.listen(port, () => {
  console.log(`Backend is running in port: ${port}`);
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down backend...`);

  try {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
  } catch (error) {
    console.error("Failed to disconnect Prisma cleanly:", error);
  }

  try {
    const redis = await getRedisClient();
    if (redis.isOpen) {
      await redis.quit();
    }
  } catch (error) {
    console.error("Failed to disconnect Redis cleanly:", error);
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
