import "dotenv/config";
import { createClient } from "redis";

type AppRedisClient = ReturnType<typeof createClient>;
type RedisProcessState = {
  client: AppRedisClient | null;
  connectPromise: Promise<AppRedisClient> | null;
};

type MetricDashProcess = NodeJS.Process & {
  __metricdashRedisState?: RedisProcessState;
};

function getRedisState() {
  const metricDashProcess = process as MetricDashProcess;

  if (!metricDashProcess.__metricdashRedisState) {
    metricDashProcess.__metricdashRedisState = {
      client: null,
      connectPromise: null,
    };
  }

  return metricDashProcess.__metricdashRedisState;
}

function getRedisUrl() {
  return process.env.REDIS_URL ?? "redis://localhost:6379";
}

export async function getRedisClient() {
  const state = getRedisState();

  if (state.client?.isOpen) {
    return state.client;
  }

  if (state.connectPromise) {
    return state.connectPromise;
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

  state.connectPromise = client
    .connect()
    .then(() => {
      state.client = client;
      return client;
    })
    .finally(() => {
      state.connectPromise = null;
    });

  return state.connectPromise;
}

export async function disconnectRedisClient() {
  const state = getRedisState();
  const client = state.client;

  state.client = null;
  state.connectPromise = null;

  if (!client) {
    return;
  }

  try {
    if (client.isOpen) {
      await client.quit();
      return;
    }
  } catch {
    // Fall through to destroy the socket if QUIT cannot complete cleanly.
  }

  if (typeof client.destroy === "function") {
    client.destroy();
  }
}
