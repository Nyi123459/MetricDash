import { OAuthAccount } from "@prisma/client";
import { PrismaAdapter } from "../adapter/prisma";
import { getPrismaClient } from "../lib/prisma";
import BaseRepository from "./base_repository";

export class OAuthAccountRepository extends BaseRepository<OAuthAccount> {
  constructor() {
    const prisma = getPrismaClient();
    super(new PrismaAdapter<OAuthAccount>(prisma.oAuthAccount));
  }
}
