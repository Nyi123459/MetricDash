import { NextFunction, Request, Response } from "express";
import { z, type ZodTypeAny } from "zod";
import { AppError } from "../exceptions/app-error";

type RequestSchemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export function validateRequest(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated: Record<string, unknown> = {};

      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body) as Request["body"];
        req.body = parsedBody;
        validated.body = parsedBody;
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query) as Record<
          string,
          unknown
        >;
        Object.assign(req.query as Record<string, unknown>, parsedQuery);
        validated.query = parsedQuery;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params) as Record<
          string,
          unknown
        >;
        Object.assign(req.params as Record<string, unknown>, parsedParams);
        validated.params = parsedParams;
      }

      (req as Request & { validated?: Record<string, unknown> }).validated =
        validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(
          new AppError(
            400,
            "VALIDATION_ERROR",
            error.issues.map((issue) => issue.message).join(", "),
            error.issues.map((issue) => ({
              code: issue.code,
              message: issue.message,
              path: issue.path.join("."),
            })),
          ),
        );
        return;
      }

      next(error);
    }
  };
}
