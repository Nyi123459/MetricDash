import { ApiKey } from "@prisma/client";
import { PrismaAdapter } from "../adapter/prisma";
import { getPrismaClient } from "../lib/prisma";
import BaseRepository from "./base_repository";

export class ApiKeyRepository extends BaseRepository<ApiKey> {
  private readonly prisma = getPrismaClient();

  constructor() {
    const prisma = getPrismaClient();
    super(new PrismaAdapter<ApiKey>(prisma.apiKey));
  }

  async countActiveByUser(userId: number) {
    return this.prisma.apiKey.count({
      where: {
        user_id: userId,
        revoked_at: null,
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
    });
  }

  async findOwnedByUser(userId: number, apiKeyId: number) {
    return this.prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        user_id: userId,
      },
    });
  }
}
