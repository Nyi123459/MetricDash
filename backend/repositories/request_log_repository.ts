import { RequestLog } from "@prisma/client";
import { PrismaAdapter } from "../adapter/prisma";
import { getPrismaClient } from "../lib/prisma";
import { CreateRequestLogInput } from "../models/request_log";
import BaseRepository from "./base_repository";

export class RequestLogRepository extends BaseRepository<RequestLog> {
  private readonly prisma = getPrismaClient();

  constructor() {
    const prisma = getPrismaClient();
    super(new PrismaAdapter<RequestLog>(prisma.requestLog));
  }

  async createLog(input: CreateRequestLogInput) {
    return this.prisma.requestLog.create({
      data: {
        request_id: input.requestId,
        user_id: input.userId,
        api_key_id: input.apiKeyId,
        url: input.url,
        normalized_url: input.normalizedUrl,
        canonical_url: input.canonicalUrl,
        domain: input.domain,
        method: input.method,
        endpoint: input.endpoint,
        status_code: input.statusCode,
        latency_ms: input.latencyMs,
        cache_hit: input.cacheHit,
        content_type: input.contentType,
        error_code: input.errorCode,
        requested_at: input.requestedAt,
      },
    });
  }

  async listRecentForUser(userId: number, limit: number) {
    return this.prisma.requestLog.findMany({
      where: {
        user_id: userId,
      },
      include: {
        api_key: true,
      },
      orderBy: {
        requested_at: "desc",
      },
      take: limit,
    });
  }

  async listForUser(userId: number, page: number, perPage: number) {
    const [data, total] = await Promise.all([
      this.prisma.requestLog.findMany({
        where: {
          user_id: userId,
        },
        include: {
          api_key: true,
        },
        orderBy: {
          requested_at: "desc",
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.requestLog.count({
        where: {
          user_id: userId,
        },
      }),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / perPage));

    return {
      data,
      meta: {
        total,
        perPage,
        currentPage: page,
        firstPage: 1,
        hasMorePages: page < lastPage,
        lastPage,
      },
    };
  }

  async summarizeForUser(userId: number) {
    const aggregate = await this.prisma.requestLog.aggregate({
      where: {
        user_id: userId,
      },
      _count: {
        id: true,
      },
      _sum: {
        latency_ms: true,
      },
    });

    const [cacheHits, errorCount] = await Promise.all([
      this.prisma.requestLog.count({
        where: {
          user_id: userId,
          cache_hit: true,
        },
      }),
      this.prisma.requestLog.count({
        where: {
          user_id: userId,
          status_code: {
            gte: 400,
          },
        },
      }),
    ]);

    return {
      totalRequests: aggregate._count.id ?? 0,
      cacheHits,
      errorCount,
      totalLatencyMs: aggregate._sum.latency_ms ?? 0,
    };
  }
}
