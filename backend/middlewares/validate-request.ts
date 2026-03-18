import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../exceptions/app-error";

export function validateRequest(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  next(
    new AppError(
      400,
      "VALIDATION_ERROR",
      result
        .array()
        .map((error) => error.msg)
        .join(", "),
    ),
  );
}
