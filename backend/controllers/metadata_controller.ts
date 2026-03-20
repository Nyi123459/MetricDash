import { Request, Response } from "express";
import { MetadataService } from "../services/metadata_service";

export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  get = async (req: Request, res: Response) => {
    const validatedQuery = (
      req as Request & { validated?: { query?: { url: string } } }
    ).validated?.query;

    const metadata = await this.metadataService.getMetadata({
      url: validatedQuery?.url ?? String(req.query.url ?? ""),
    });

    res.status(200).json(metadata);
  };
}
