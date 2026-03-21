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

    res.locals.metadataCacheStatus = metadata.cache.hit ? "hit" : "miss";
    res.locals.metadataNormalizedUrl = metadata.url;
    res.locals.metadataCanonicalUrl = metadata.canonical_url;
    res.locals.metadataContentType = metadata.content_type;

    res.status(200).json(metadata);
  };
}
