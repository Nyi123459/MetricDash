require("ts-node/register/transpile-only");

const { disconnectPrismaClient } = require("../lib/prisma");
const { disconnectRedisClient } = require("../lib/redis");

module.exports = async () => {
  await Promise.allSettled([disconnectPrismaClient(), disconnectRedisClient()]);
};
