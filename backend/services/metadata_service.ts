import { AppError } from "../exceptions/app-error";
import { GetMetadataInput, MetadataResponse } from "../models/metadata";

type FetchLike = typeof fetch;
type ParsedTag = Record<string, string>;
type JsonLdEntry = Record<string, unknown>;

export class MetadataService {
  private static readonly FETCH_TIMEOUT_MS = 50000;

  constructor(private readonly fetchImpl: FetchLike = fetch) {}

  async getMetadata(input: GetMetadataInput): Promise<MetadataResponse> {
    const requestedUrl = this.normalizeInputUrl(input.url);
    const page = await this.fetchPage(requestedUrl);

    return this.extractMetadata({
      requestedUrl,
      finalUrl: page.finalUrl,
      contentType: page.contentType,
      html: page.html,
    });
  }

  private normalizeInputUrl(rawUrl: string) {
    const trimmedUrl = rawUrl.trim();

    if (!trimmedUrl) {
      throw new AppError(400, "METADATA_URL_REQUIRED", "URL is required");
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      throw new AppError(
        400,
        "METADATA_URL_INVALID",
        "URL must be a valid http or https URL",
      );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new AppError(
        400,
        "METADATA_URL_INVALID",
        "URL must be a valid http or https URL",
      );
    }

    parsedUrl.hash = "";

    return parsedUrl.toString();
  }

  private async fetchPage(url: string) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      MetadataService.FETCH_TIMEOUT_MS,
    );

    try {
      const response = await this.fetchImpl(url, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "MetricDashMetadataBot/1.0",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AppError(
          502,
          "METADATA_FETCH_FAILED",
          `Metadata source responded with status ${response.status}`,
        );
      }

      const contentType = response.headers.get("content-type");

      if (!this.isHtmlContentType(contentType)) {
        throw new AppError(
          415,
          "METADATA_CONTENT_TYPE_INVALID",
          "Metadata source must return an HTML document",
        );
      }

      const html = await response.text();

      if (!html.trim()) {
        throw new AppError(
          502,
          "METADATA_EMPTY_DOCUMENT",
          "Metadata source returned an empty HTML document",
        );
      }

      return {
        html,
        finalUrl: response.url || url,
        contentType,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError(
          504,
          "METADATA_FETCH_TIMEOUT",
          "Metadata source timed out",
        );
      }

      throw new AppError(
        502,
        "METADATA_FETCH_FAILED",
        "Unable to fetch metadata source",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractMetadata(input: {
    requestedUrl: string;
    finalUrl: string;
    contentType: string | null;
    html: string;
  }): MetadataResponse {
    const metaTags = this.parseTags(input.html, "meta");
    const linkTags = this.parseTags(input.html, "link");
    const jsonLdEntries = this.parseJsonLd(input.html);
    const baseHref = this.getBaseHref(input.html, input.finalUrl);

    const canonicalUrl =
      this.resolveUrl(
        this.getCanonicalHref(linkTags),
        baseHref ?? input.finalUrl,
      ) ??
      this.resolveUrl(
        this.getJsonLdString(jsonLdEntries, ["url", "mainEntityOfPage"]),
        baseHref ?? input.finalUrl,
      ) ??
      input.finalUrl;

    const finalUrlObject = new URL(input.finalUrl);
    const siteNameFallback = this.stripWww(finalUrlObject.hostname);
    const ogType = this.getMetaContent(metaTags, ["og:type"]);

    return {
      url: input.requestedUrl,
      canonical_url: canonicalUrl,
      title: this.pickFirst([
        this.getMetaContent(metaTags, ["og:title", "twitter:title"]),
        this.getJsonLdString(jsonLdEntries, ["name", "headline"]),
        this.getDocumentTitle(input.html),
      ]),
      description: this.pickFirst([
        this.getMetaContent(metaTags, [
          "og:description",
          "twitter:description",
        ]),
        this.getJsonLdString(jsonLdEntries, ["description"]),
        this.getMetaContent(metaTags, ["description"]),
      ]),
      image:
        this.resolveUrl(
          this.getMetaContent(metaTags, ["og:image", "twitter:image"]),
          baseHref ?? input.finalUrl,
        ) ??
        this.resolveUrl(
          this.getJsonLdString(jsonLdEntries, ["thumbnailUrl", "image"]),
          baseHref ?? input.finalUrl,
        ) ??
        null,
      favicon:
        this.resolveUrl(
          this.getFaviconHref(linkTags),
          baseHref ?? input.finalUrl,
        ) ?? new URL("/favicon.ico", input.finalUrl).toString(),
      site_name: this.pickFirst([
        this.getMetaContent(metaTags, ["og:site_name"]),
        this.getJsonLdPublisherName(jsonLdEntries),
        siteNameFallback,
      ]),
      content_type: this.pickFirst([
        ogType,
        this.getJsonLdContentType(jsonLdEntries),
        this.normalizeResponseContentType(input.contentType),
        "website",
      ]),
      author: this.pickFirst([
        this.getMetaContent(metaTags, [
          "author",
          "article:author",
          "twitter:creator",
        ]),
        this.getJsonLdAuthorName(jsonLdEntries),
      ]),
      published_at: this.normalizePublishedAt(
        this.getMetaContent(metaTags, [
          "article:published_time",
          "og:published_time",
          "publish-date",
          "pubdate",
          "date",
        ]) ??
          this.getJsonLdString(jsonLdEntries, [
            "uploadDate",
            "datePublished",
            "dateCreated",
          ]),
      ),
      cache: {
        hit: false,
        ttl: 0,
      },
    };
  }

  private isHtmlContentType(contentType: string | null) {
    const normalized = contentType?.toLowerCase() ?? "";
    return (
      normalized.includes("text/html") ||
      normalized.includes("application/xhtml+xml")
    );
  }

  private normalizeResponseContentType(contentType: string | null) {
    if (!contentType) {
      return null;
    }

    const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? null;
    return normalized === "text/html" ? "website" : normalized;
  }

  private parseTags(html: string, tagName: "meta" | "link"): ParsedTag[] {
    const tagExpression = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
    return Array.from(html.matchAll(tagExpression), (match) =>
      this.parseAttributes(match[0]),
    );
  }

  private parseAttributes(tag: string): ParsedTag {
    const attributes: ParsedTag = {};
    const attributeExpression =
      /([a-zA-Z_:.-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;

    for (const match of tag.matchAll(attributeExpression)) {
      const attributeName = match[1]?.toLowerCase();
      const attributeValue = match[3] ?? match[4] ?? match[5] ?? "";
      const cleanedValue = this.cleanText(attributeValue);

      if (attributeName && cleanedValue) {
        attributes[attributeName] = cleanedValue;
      }
    }

    return attributes;
  }

  private getMetaContent(metaTags: ParsedTag[], keys: string[]) {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase();
      const tag = metaTags.find(
        (candidate) =>
          candidate.property?.toLowerCase() === normalizedKey ||
          candidate.name?.toLowerCase() === normalizedKey,
      );

      if (tag?.content) {
        return this.cleanText(tag.content);
      }
    }

    return null;
  }

  private getCanonicalHref(linkTags: ParsedTag[]) {
    return (
      linkTags.find(
        (tag) => this.relIncludes(tag.rel, "canonical") && Boolean(tag.href),
      )?.href ?? null
    );
  }

  private getFaviconHref(linkTags: ParsedTag[]) {
    const relPriority = [
      "icon",
      "shortcut icon",
      "apple-touch-icon",
      "apple-touch-icon-precomposed",
    ];

    for (const relValue of relPriority) {
      const match = linkTags.find(
        (tag) => this.relIncludes(tag.rel, relValue) && Boolean(tag.href),
      );

      if (match?.href) {
        return match.href;
      }
    }

    return null;
  }

  private getBaseHref(html: string, finalUrl: string) {
    const baseTag =
      /<base\b[^>]*href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(html);
    const href = baseTag?.[2] ?? baseTag?.[3] ?? baseTag?.[4] ?? null;
    return this.resolveUrl(href, finalUrl);
  }

  private getDocumentTitle(html: string) {
    const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    return this.cleanText(titleMatch?.[1] ?? null);
  }

  private resolveUrl(candidate: string | null, baseUrl: string) {
    const sanitizedCandidate = this.sanitizeUrlCandidate(candidate);

    if (!sanitizedCandidate) {
      return null;
    }

    try {
      const resolved = new URL(sanitizedCandidate, baseUrl);

      if (!["http:", "https:"].includes(resolved.protocol)) {
        return null;
      }

      return resolved.toString();
    } catch {
      return null;
    }
  }

  private parseJsonLd(html: string) {
    const scriptExpression =
      /<script\b[^>]*type\s*=\s*("application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi;
    const entries: JsonLdEntry[] = [];

    for (const match of html.matchAll(scriptExpression)) {
      const rawJson = match[2]?.trim();

      if (!rawJson) {
        continue;
      }

      try {
        const parsed = JSON.parse(rawJson) as unknown;
        entries.push(...this.flattenJsonLdEntries(parsed));
      } catch {
        continue;
      }
    }

    return entries;
  }

  private flattenJsonLdEntries(value: unknown): JsonLdEntry[] {
    if (Array.isArray(value)) {
      return value.flatMap((entry) => this.flattenJsonLdEntries(entry));
    }

    if (!this.isJsonLdEntry(value)) {
      return [];
    }

    const graph = value["@graph"];

    if (Array.isArray(graph)) {
      return [
        value,
        ...graph.flatMap((entry) => this.flattenJsonLdEntries(entry)),
      ];
    }

    return [value];
  }

  private getJsonLdString(entries: JsonLdEntry[], keys: string[]) {
    for (const entry of entries) {
      for (const key of keys) {
        const value = entry[key];
        const normalized = this.extractJsonLdString(value);

        if (normalized) {
          return normalized;
        }
      }
    }

    return null;
  }

  private getJsonLdAuthorName(entries: JsonLdEntry[]) {
    for (const entry of entries) {
      const author = entry.author;

      if (Array.isArray(author)) {
        for (const authorEntry of author) {
          const name = this.extractNamedJsonLdValue(authorEntry);

          if (name) {
            return name;
          }
        }
      }

      const name = this.extractNamedJsonLdValue(author);

      if (name) {
        return name;
      }
    }

    return null;
  }

  private getJsonLdPublisherName(entries: JsonLdEntry[]) {
    for (const entry of entries) {
      const publisherName = this.extractNamedJsonLdValue(entry.publisher);

      if (publisherName) {
        return publisherName;
      }

      const providerName = this.extractNamedJsonLdValue(entry.provider);

      if (providerName) {
        return providerName;
      }
    }

    return null;
  }

  private getJsonLdContentType(entries: JsonLdEntry[]) {
    for (const entry of entries) {
      const typeValue = this.extractJsonLdType(entry["@type"]);

      if (typeValue === "VideoObject") {
        return "video";
      }

      if (
        typeValue === "Article" ||
        typeValue === "NewsArticle" ||
        typeValue === "BlogPosting"
      ) {
        return "article";
      }

      if (typeValue === "WebSite" || typeValue === "WebPage") {
        return "website";
      }
    }

    return null;
  }

  private extractJsonLdType(value: unknown) {
    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.find((item) => typeof item === "string") ?? null;
    }

    return null;
  }

  private extractNamedJsonLdValue(value: unknown) {
    if (typeof value === "string") {
      return this.cleanText(value);
    }

    if (this.isJsonLdEntry(value)) {
      return this.extractJsonLdString(value.name);
    }

    return null;
  }

  private extractJsonLdString(value: unknown): string | null {
    if (typeof value === "string") {
      return this.cleanText(value);
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const normalized = this.extractJsonLdString(item);

        if (normalized) {
          return normalized;
        }
      }

      return null;
    }

    if (this.isJsonLdEntry(value)) {
      const directUrl = this.extractJsonLdString(value.url);

      if (directUrl) {
        return directUrl;
      }

      const directId = this.extractJsonLdString(value["@id"]);

      if (directId) {
        return directId;
      }
    }

    return null;
  }

  private sanitizeUrlCandidate(candidate: string | null) {
    const normalized = this.cleanText(candidate);

    if (!normalized) {
      return null;
    }

    const lowerCased = normalized.toLowerCase();

    if (
      lowerCased === "undefined" ||
      lowerCased === "null" ||
      lowerCased === "false"
    ) {
      return null;
    }

    return normalized;
  }

  private isJsonLdEntry(value: unknown): value is JsonLdEntry {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private relIncludes(rel: string | undefined, expected: string) {
    if (!rel) {
      return false;
    }

    return rel.toLowerCase().split(/\s+/).includes(expected.toLowerCase());
  }

  private normalizePublishedAt(value: string | null) {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  private pickFirst(values: Array<string | null>) {
    return values.find((value) => Boolean(value)) ?? null;
  }

  private cleanText(value: string | null) {
    if (!value) {
      return null;
    }

    return this.decodeHtmlEntities(value).replace(/\s+/g, " ").trim() || null;
  }

  private decodeHtmlEntities(value: string) {
    return value
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
  }

  private stripWww(hostname: string) {
    return hostname.replace(/^www\./i, "");
  }
}
