import { Request, Response } from "express";
import { ApiKeyService } from "../services/api_key_service";

export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  create = async (req: Request, res: Response) => {
    const result = await this.apiKeyService.create({
      userId: res.locals.authenticatedUserId,
      name: req.body.name,
      requestsPerMinute: req.body.requestsPerMinute,
      expiresAt: req.body.expiresAt,
    });

    res.status(201).json({
      message: "API key created successfully",
      apiKey: result.apiKey,
      secret: result.secret,
      requestId: res.locals.requestId,
    });
  };

  list = async (req: Request, res: Response) => {
    const validatedQuery = (
      req as Request & {
        validated?: { query?: { page: number; perPage: number } };
      }
    ).validated?.query;
    const apiKeys = await this.apiKeyService.listForUser({
      userId: res.locals.authenticatedUserId,
      page: validatedQuery?.page ?? 1,
      perPage: validatedQuery?.perPage ?? 10,
    });

    res.status(200).json({
      data: apiKeys.data,
      meta: apiKeys.meta,
      requestId: res.locals.requestId,
    });
  };

  revoke = async (req: Request, res: Response) => {
    const validatedParams = (
      req as Request & {
        validated?: { params?: { id: number } };
      }
    ).validated?.params;
    const apiKey = await this.apiKeyService.revoke({
      userId: res.locals.authenticatedUserId,
      apiKeyId: validatedParams?.id ?? Number(req.params.id),
    });

    res.status(200).json({
      message: "API key revoked successfully",
      apiKey,
      requestId: res.locals.requestId,
    });
  };
}
