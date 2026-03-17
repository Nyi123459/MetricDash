import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

function hasDiscreteDbConfig() {
  return Boolean(
    process.env.DATABASE_HOST &&
      process.env.DATABASE_USER &&
      process.env.DATABASE_PASSWORD &&
      process.env.DATABASE_NAME,
  );
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return new PrismaClient({ adapter: new PrismaMariaDb(connectionString) });
  }

  if (hasDiscreteDbConfig()) {
    return new PrismaClient({
      adapter: new PrismaMariaDb({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionLimit: 5,
      }),
    });
  }

  throw new Error(
    "Database configuration is missing. Set DATABASE_URL or DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME.",
  );
}

export function getPrismaClient() {
  if (!prisma) {
    prisma = createPrismaClient();
  }

  return prisma;
}
