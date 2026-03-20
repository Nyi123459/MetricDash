import { Router } from "express";
import { PublicApiController } from "../controllers/public_api_controller";
import { authenticateApiKey } from "../middlewares/authenticate-api-key";

const publicApiRouter = Router();
const publicApiController = new PublicApiController();

publicApiRouter.get("/ping", authenticateApiKey, publicApiController.ping);

export { publicApiRouter };
