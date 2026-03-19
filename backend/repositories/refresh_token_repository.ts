import { RefreshToken } from "@prisma/client";
import { PrismaAdapter } from "../adapter/prisma";
import { getPrismaClient } from "../lib/prisma";
import BaseRepository from "./base_repository";

const prisma = getPrismaClient();

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super(new PrismaAdapter<RefreshToken>(prisma.refreshToken));
  }
}
