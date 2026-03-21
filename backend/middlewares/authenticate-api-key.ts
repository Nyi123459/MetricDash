import { NextFunction, Request, Response } from "express";
import { RedisApiKeyMetadataCache } from "../infrastructure/cache/redis_api_key_metadata_cache";
import { AppError } from "../exceptions/app-error";
import { ApiKeyRepository } from "../repositories/api_key_repository";
import { ApiKeyService } from "../services/api_key_service";

const apiKeyRepository = new ApiKeyRepository();
const apiKeyMetadataCache = new RedisApiKeyMetadataCache();
const apiKeyService = new ApiKeyService(apiKeyRepository, apiKeyMetadataCache);

export async function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    next(new AppError(401, "API_KEY_REQUIRED", "API key is required"));
    return;
  }

  try {
    const result = await apiKeyService.authenticate({
      rawApiKey: authorizationHeader.slice("Bearer ".length),
    });

    res.locals.apiKeyId = result.apiKey.id;
    res.locals.apiKeyUserId = result.apiKey.user_id;
    res.locals.apiKeyRequestsPerMinute = result.apiKey.requests_per_minute;
    next();
  } catch (error) {
    next(error);
  }
}
