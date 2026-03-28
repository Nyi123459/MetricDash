import { render, screen } from "@testing-library/react";
import { MetadataPreviewPanel } from "@/features/dashboard/components/metadata-preview-panel";
import { useApiKeys } from "@/features/api-keys/hooks/use-api-keys";
import { useDashboardMetadataPreview } from "@/features/dashboard/hooks/use-dashboard-data";

jest.mock("@/features/api-keys/hooks/use-api-keys", () => ({
  useApiKeys: jest.fn(),
}));

jest.mock("@/features/dashboard/hooks/use-dashboard-data", () => ({
  useDashboardMetadataPreview: jest.fn(),
}));

const mockUseApiKeys = jest.mocked(useApiKeys);
const mockUseDashboardMetadataPreview = jest.mocked(
  useDashboardMetadataPreview,
);

describe("MetadataPreviewPanel", () => {
  it("renders image and favicon previews when the metadata response includes assets", () => {
    mockUseApiKeys.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 1,
            name: "Preview key",
            key_prefix: "md_live",
            revoked_at: null,
            expires_at: null,
          },
        ],
      },
    } as ReturnType<typeof useApiKeys>);

    mockUseDashboardMetadataPreview.mockReturnValue({
      data: {
        apiKey: {
          id: 1,
          name: "Preview key",
        },
        metadata: {
          url: "https://example.com/article",
          canonical_url: "https://example.com/article",
          title: "Example title",
          description: "Example description",
          image: "https://example.com/image.jpg",
          favicon: "https://example.com/favicon.ico",
          site_name: "Example",
          content_type: "article",
          author: null,
          published_at: null,
          cache: {
            hit: true,
            ttl: 120,
          },
        },
        rateLimit: {
          allowed: true,
          limit: 60,
          remaining: 59,
          resetAfterSeconds: 30,
          retryAfterSeconds: 0,
        },
        requestId: "mdreq_test",
      },
      isPending: false,
      isError: false,
      mutateAsync: jest.fn(),
    } as ReturnType<typeof useDashboardMetadataPreview>);

    render(<MetadataPreviewPanel />);

    expect(
      screen.getByRole("img", { name: "Preview image for Example title" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Favicon for Example title" }),
    ).toBeInTheDocument();
  });
});
