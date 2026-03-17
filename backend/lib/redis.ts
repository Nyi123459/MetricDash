import "dotenv/config";
import { createClient } from "redis";

type AppRedisClient = ReturnType<typeof createClient>;

let redisClient: AppRedisClient | null = null;
let redisConnectPromise: Promise<AppRedisClient> | null = null;

function getRedisUrl() {
  return process.env.REDIS_URL ?? "redis://localhost:6379";
}

export async function getRedisClient() {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (redisConnectPromise) {
    return redisConnectPromise;
  }

  const client = createClient({
    url: getRedisUrl(),
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: false,
    },
  });

  client.on("error", (error) => {
    console.error("Redis client error:", error);
  });

  redisConnectPromise = client
    .connect()
    .then(() => {
      redisClient = client;
      return client;
    })
    .finally(() => {
      redisConnectPromise = null;
    });

  return redisConnectPromise;
}
