import { Request, Response } from "express";
import { BillingService } from "../services/billing_service";

export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  estimate = async (req: Request, res: Response) => {
    const startDate =
      typeof req.query.startDate === "string"
        ? this.fromDateQuery(req.query.startDate)
        : undefined;
    const endDate =
      typeof req.query.endDate === "string"
        ? this.fromDateQuery(req.query.endDate)
        : undefined;

    const estimate = await this.billingService.getEstimate({
      userId: res.locals.authenticatedUserId,
      activityStartDate: startDate,
      activityEndDate: endDate,
    });

    res.status(200).json({
      ...estimate,
      requestId: res.locals.requestId,
    });
  };

  private fromDateQuery(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
  }
}
