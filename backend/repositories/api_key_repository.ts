import { ApiKey } from "@prisma/client";
import { PrismaAdapter } from "../adapter/prisma";
import { getPrismaClient } from "../lib/prisma";
import BaseRepository from "./base_repository";

export class ApiKeyRepository extends BaseRepository<ApiKey> {
  constructor() {
    const prisma = getPrismaClient();
    super(new PrismaAdapter<ApiKey>(prisma.apiKey));
  }
}
