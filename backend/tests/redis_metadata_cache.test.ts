jest.mock("../lib/redis", () => ({
  getRedisClient: jest.fn(),
}));

import { getRedisClient } from "../lib/redis";
import { RedisMetadataCache } from "../infrastructure/cache/redis_metadata_cache";

describe("RedisMetadataCache", () => {
  it("returns cached metadata together with the remaining TTL", async () => {
    const redis = {
      get: jest.fn(async () =>
        JSON.stringify({
          url: "https://example.com/article",
          canonical_url: "https://example.com/article",
          title: "Example title",
          description: "Example description",
          image: null,
          favicon: "https://example.com/favicon.ico",
          site_name: "Example",
          content_type: "article",
          author: null,
          published_at: null,
          cache: {
            hit: false,
            ttl: 0,
          },
        }),
      ),
      ttl: jest.fn(async () => 120),
    };

    (getRedisClient as jest.Mock).mockResolvedValue(redis);

    const cache = new RedisMetadataCache();
    const result = await cache.get("https://example.com/article");

    expect(result).toMatchObject({
      ttl: 120,
      metadata: {
        title: "Example title",
        cache: {
          hit: false,
          ttl: 0,
        },
      },
    });
  });

  it("writes cached metadata using the configured TTL", async () => {
    const redis = {
      set: jest.fn(async () => "OK"),
    };

    (getRedisClient as jest.Mock).mockResolvedValue(redis);

    const cache = new RedisMetadataCache();
    await cache.set("https://example.com/article", {
      url: "https://example.com/article",
      canonical_url: "https://example.com/article",
      title: "Example title",
      description: "Example description",
      image: null,
      favicon: "https://example.com/favicon.ico",
      site_name: "Example",
      content_type: "article",
      author: null,
      published_at: null,
      cache: {
        hit: false,
        ttl: 0,
      },
    });

    expect(redis.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        EX: 43200,
      }),
    );
  });
});
