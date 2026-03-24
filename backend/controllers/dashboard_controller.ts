import { Request, Response } from "express";
import { DashboardMetadataPreviewService } from "../services/dashboard_metadata_preview_service";
import { DashboardService } from "../services/dashboard_service";

export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly dashboardMetadataPreviewService: DashboardMetadataPreviewService,
  ) {}

  overview = async (req: Request, res: Response) => {
    const validatedQuery = (
      req as Request & { validated?: { query?: { days: number } } }
    ).validated?.query;

    const overview = await this.dashboardService.getOverview({
      userId: res.locals.authenticatedUserId,
      userEmail: res.locals.authenticatedUserEmail ?? null,
      days: validatedQuery?.days ?? 7,
    });

    res.status(200).json({
      ...overview,
      requestId: res.locals.requestId,
    });
  };

  usage = async (req: Request, res: Response) => {
    const validatedQuery = (
      req as Request & { validated?: { query?: { days: number } } }
    ).validated?.query;

    const usage = await this.dashboardService.getUsage({
      userId: res.locals.authenticatedUserId,
      days: validatedQuery?.days ?? 7,
    });

    res.status(200).json({
      ...usage,
      requestId: res.locals.requestId,
    });
  };

  logs = async (req: Request, res: Response) => {
    const validatedQuery = (
      req as Request & {
        validated?: { query?: { page: number; perPage: number } };
      }
    ).validated?.query;

    const logs = await this.dashboardService.getLogs({
      userId: res.locals.authenticatedUserId,
      page: validatedQuery?.page ?? 1,
      perPage: validatedQuery?.perPage ?? 20,
    });

    res.status(200).json({
      ...logs,
      requestId: res.locals.requestId,
    });
  };

  previewMetadata = async (req: Request, res: Response) => {
    const validatedBody = (
      req as Request & {
        validated?: { body?: { apiKeyId: number; url: string } };
      }
    ).validated?.body;

    const preview = await this.dashboardMetadataPreviewService.preview({
      userId: res.locals.authenticatedUserId,
      apiKeyId: validatedBody?.apiKeyId ?? Number(req.body.apiKeyId),
      url: validatedBody?.url ?? String(req.body.url ?? ""),
      requestId: res.locals.requestId,
      endpoint: req.baseUrl + req.path,
    });

    res.setHeader("X-RateLimit-Limit", preview.rateLimit.limit.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      preview.rateLimit.remaining.toString(),
    );
    res.setHeader(
      "X-RateLimit-Reset",
      preview.rateLimit.resetAfterSeconds.toString(),
    );

    res.status(200).json({
      ...preview,
      requestId: res.locals.requestId,
    });
  };
}
