import { Router } from "express";
import { MetadataController } from "../controllers/metadata_controller";
import { authenticateApiKey } from "../middlewares/authenticate-api-key";
import { validateRequest } from "../middlewares/validate-request";
import { MetadataService } from "../services/metadata_service";
import { metadataQuerySchema } from "../validations/metadata-schemas";

const metadataRouter = Router();
const metadataService = new MetadataService();
const metadataController = new MetadataController(metadataService);

metadataRouter.get(
  "/",
  authenticateApiKey,
  validateRequest({ query: metadataQuerySchema }),
  metadataController.get,
);

export { metadataRouter };
