import { Request, Response } from "express";
import { BillingService } from "../services/billing_service";

export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  estimate = async (_req: Request, res: Response) => {
    const estimate = await this.billingService.getEstimate({
      userId: res.locals.authenticatedUserId,
    });

    res.status(200).json({
      ...estimate,
      requestId: res.locals.requestId,
    });
  };
}
