import { disconnectRedisClient } from "../lib/redis";

afterAll(async () => {
  await disconnectRedisClient();
});
