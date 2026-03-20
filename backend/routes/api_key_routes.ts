import { Router } from "express";
import { ApiKeyController } from "../controllers/api_key_controller";
import { RedisApiKeyMetadataCache } from "../infrastructure/cache/redis_api_key_metadata_cache";
import { authenticateSession } from "../middlewares/authenticate-session";
import { validateRequest } from "../middlewares/validate-request";
import { ApiKeyRepository } from "../repositories/api_key_repository";
import { ApiKeyService } from "../services/api_key_service";
import {
  createApiKeyBodySchema,
  listApiKeysQuerySchema,
  revokeApiKeyParamsSchema,
} from "../validations/api-key-schemas";

const apiKeyRouter = Router();

const apiKeyRepository = new ApiKeyRepository();
const apiKeyMetadataCache = new RedisApiKeyMetadataCache();
const apiKeyService = new ApiKeyService(apiKeyRepository, apiKeyMetadataCache);
const apiKeyController = new ApiKeyController(apiKeyService);

apiKeyRouter.use(authenticateSession);

apiKeyRouter.post(
  "/",
  validateRequest({ body: createApiKeyBodySchema }),
  apiKeyController.create,
);

apiKeyRouter.get(
  "/",
  validateRequest({ query: listApiKeysQuerySchema }),
  apiKeyController.list,
);

apiKeyRouter.post(
  "/:id/revoke",
  validateRequest({ params: revokeApiKeyParamsSchema }),
  apiKeyController.revoke,
);

export { apiKeyRouter };
