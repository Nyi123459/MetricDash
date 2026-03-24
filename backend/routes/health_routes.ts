import { Router } from "express";
import { HealthController } from "../controllers/health_controller";
import { PrismaHealthIndicator } from "../infrastructure/health/prisma_health_indicator";
import { RedisHealthIndicator } from "../infrastructure/health/redis_health_indicator";
import { HealthService } from "../services/health_service";

const healthRouter = Router();
const healthService = new HealthService([
  new PrismaHealthIndicator(),
  new RedisHealthIndicator(),
]);
const healthController = new HealthController(healthService);

healthRouter.get("/", healthController.live);
healthRouter.get("/ready", healthController.ready);
healthRouter.get("/db", healthController.database);
healthRouter.get("/redis", healthController.redis);

export { healthRouter };
