import { Router } from "express";
import { BillingController } from "../controllers/billing_controller";
import { authenticateSession } from "../middlewares/authenticate-session";
import { validateRequest } from "../middlewares/validate-request";
import { BillingCycleRepository } from "../repositories/billing_cycle_repository";
import { UsageRecordRepository } from "../repositories/usage_record_repository";
import { BillingService } from "../services/billing_service";
import { billingEstimateQuerySchema } from "../validations/billing-schemas";

const billingRouter = Router();
const usageRecordRepository = new UsageRecordRepository();
const billingCycleRepository = new BillingCycleRepository();
const billingService = new BillingService(
  usageRecordRepository,
  billingCycleRepository,
);
const billingController = new BillingController(billingService);

billingRouter.use(authenticateSession);

billingRouter.get(
  "/estimate",
  validateRequest({ query: billingEstimateQuerySchema }),
  billingController.estimate,
);

export { billingRouter };
