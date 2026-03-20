import { Request, Response } from "express";

export class PublicApiController {
  ping = (_req: Request, res: Response) => {
    res.status(200).json({
      message: "API key authenticated successfully",
      data: {
        apiKeyId: res.locals.apiKeyId,
        userId: res.locals.apiKeyUserId,
        authenticatedAt: new Date().toISOString(),
      },
      requestId: res.locals.requestId,
    });
  };
}
