import { MetadataService } from "../services/metadata_service";

function createMockResponse(input: {
  ok: boolean;
  status: number;
  url: string;
  html: string;
  contentType: string;
}) {
  return {
    ok: input.ok,
    status: input.status,
    url: input.url,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" ? input.contentType : null,
    },
    text: async () => input.html,
  } as Response;
}

describe("MetadataService", () => {
  it("extracts and normalizes metadata from an HTML document", async () => {
    const fetchMock = jest.fn(async () =>
      createMockResponse({
        ok: true,
        status: 200,
        url: "https://example.com/articles/test",
        contentType: "text/html; charset=utf-8",
        html: `
          <html>
            <head>
              <title>Fallback title</title>
              <meta property="og:title" content="OG Title" />
              <meta property="og:description" content="OG Description" />
              <meta property="og:image" content="/images/cover.png" />
              <meta property="og:site_name" content="MetricDash Blog" />
              <meta property="article:published_time" content="2026-03-20T10:30:00Z" />
              <meta name="author" content="Metric Dash" />
              <link rel="canonical" href="/canonical-article" />
              <link rel="icon" href="/favicon.ico" />
            </head>
            <body>hello</body>
          </html>
        `,
      }),
    );

    const service = new MetadataService(fetchMock as typeof fetch);
    const result = await service.getMetadata({
      url: "https://example.com/articles/test#fragment",
    });

    expect(result).toMatchObject({
      url: "https://example.com/articles/test",
      canonical_url: "https://example.com/canonical-article",
      title: "OG Title",
      description: "OG Description",
      image: "https://example.com/images/cover.png",
      favicon: "https://example.com/favicon.ico",
      site_name: "MetricDash Blog",
      content_type: "website",
      author: "Metric Dash",
      published_at: "2026-03-20T10:30:00.000Z",
      cache: {
        hit: false,
        ttl: 0,
      },
    });
  });

  it("rejects non-html responses", async () => {
    const fetchMock = jest.fn(async () =>
      createMockResponse({
        ok: true,
        status: 200,
        url: "https://example.com/file.pdf",
        contentType: "application/pdf",
        html: "%PDF",
      }),
    );

    const service = new MetadataService(fetchMock as typeof fetch);

    await expect(
      service.getMetadata({ url: "https://example.com/file.pdf" }),
    ).rejects.toMatchObject({
      code: "METADATA_CONTENT_TYPE_INVALID",
    });
  });

  it("rejects invalid URLs", async () => {
    const service = new MetadataService(jest.fn() as typeof fetch);

    await expect(
      service.getMetadata({ url: "ftp://example.com/file" }),
    ).rejects.toMatchObject({
      code: "METADATA_URL_INVALID",
    });
  });

  it("falls back to JSON-LD data and ignores invalid canonical placeholders", async () => {
    const fetchMock = jest.fn(async () =>
      createMockResponse({
        ok: true,
        status: 200,
        url: "https://www.youtube.com/watch?v=h5o6ty4U-Oo",
        contentType: "text/html; charset=utf-8",
        html: `
          <html>
            <head>
              <title>- YouTube</title>
              <meta name="description" content="Enjoy the videos and music that you love..." />
              <link rel="canonical" href="undefined" />
              <link rel="icon" href="/favicon.ico" />
              <script type="application/ld+json">
                {
                  "@context": "https://schema.org",
                  "@type": "VideoObject",
                  "name": "Set Fire To The Rain x Another Love - PT/EN",
                  "description": "for all lovers",
                  "thumbnailUrl": "https://i.ytimg.com/vi/h5o6ty4U-Oo/maxresdefault.jpg",
                  "uploadDate": "2022-06-18T23:33:51.000Z",
                  "url": "https://www.youtube.com/watch?v=h5o6ty4U-Oo",
                  "author": {
                    "@type": "Person",
                    "name": "Scrolz"
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "YouTube"
                  }
                }
              </script>
            </head>
            <body>video</body>
          </html>
        `,
      }),
    );

    const service = new MetadataService(fetchMock as typeof fetch);
    const result = await service.getMetadata({
      url: "https://www.youtube.com/watch?v=h5o6ty4U-Oo",
    });

    expect(result).toMatchObject({
      url: "https://www.youtube.com/watch?v=h5o6ty4U-Oo",
      canonical_url: "https://www.youtube.com/watch?v=h5o6ty4U-Oo",
      title: "Set Fire To The Rain x Another Love - PT/EN",
      description: "for all lovers",
      image: "https://i.ytimg.com/vi/h5o6ty4U-Oo/maxresdefault.jpg",
      favicon: "https://www.youtube.com/favicon.ico",
      site_name: "YouTube",
      content_type: "video",
      author: "Scrolz",
      published_at: "2022-06-18T23:33:51.000Z",
    });
  });
});
