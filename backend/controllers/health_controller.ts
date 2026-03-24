import { Request, Response } from "express";
import { AppError } from "../exceptions/app-error";
import { HealthDependencyCheck, HealthStatus } from "../models/health";
import { HealthService } from "../services/health_service";

type BaseHealthPayload = {
  status: HealthStatus;
  service: string;
  requestId: string;
  timestamp: string;
  uptimeSeconds: number;
};

export class HealthController {
  private static readonly SERVICE_NAME = "metricdash-backend";

  constructor(private readonly healthService: HealthService) {}

  live = (_req: Request, res: Response) => {
    res.status(200).json({
      ...this.buildBasePayload(res, "ok"),
      checks: {
        app: {
          status: "up",
        },
      },
    });
  };

  ready = async (_req: Request, res: Response) => {
    const readiness = await this.healthService.getReadiness();

    res.status(readiness.status === "ok" ? 200 : 503).json({
      ...this.buildBasePayload(res, readiness.status),
      dependencies: readiness.dependencies,
    });
  };

  database = async (_req: Request, res: Response) => {
    const dependency = await this.requireDependency("database");

    res.status(dependency.status === "up" ? 200 : 503).json({
      ...this.buildBasePayload(
        res,
        dependency.status === "up" ? "ok" : "error",
      ),
      dependency,
    });
  };

  redis = async (_req: Request, res: Response) => {
    const dependency = await this.requireDependency("redis");

    res.status(dependency.status === "up" ? 200 : 503).json({
      ...this.buildBasePayload(
        res,
        dependency.status === "up" ? "ok" : "error",
      ),
      dependency,
    });
  };

  private async requireDependency(
    name: string,
  ): Promise<HealthDependencyCheck> {
    const dependency = await this.healthService.getDependency(name);

    if (!dependency) {
      throw new AppError(
        500,
        "HEALTH_INDICATOR_NOT_CONFIGURED",
        `Health indicator ${name} is not configured`,
      );
    }

    return dependency;
  }

  private buildBasePayload(
    res: Response,
    status: HealthStatus,
  ): BaseHealthPayload {
    return {
      status,
      service: HealthController.SERVICE_NAME,
      requestId: String(res.locals.requestId ?? ""),
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
