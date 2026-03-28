import { redirect } from "next/navigation";
import { requireDashboardSession } from "@/features/dashboard/lib/require-dashboard-session";
import {
  getValidatedSession,
  hasRefreshTokenSessionCandidate,
} from "@/features/auth/lib/server-session";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/features/auth/lib/server-session", () => ({
  getValidatedSession: jest.fn(),
  hasRefreshTokenSessionCandidate: jest.fn(),
}));

const mockRedirect = jest.mocked(redirect);
const mockGetValidatedSession = jest.mocked(getValidatedSession);
const mockHasRefreshTokenSessionCandidate = jest.mocked(
  hasRefreshTokenSessionCandidate,
);

describe("requireDashboardSession", () => {
  beforeEach(() => {
    mockRedirect.mockReset();
    mockGetValidatedSession.mockReset();
    mockHasRefreshTokenSessionCandidate.mockReset();
  });

  it("allows dashboard rendering when a refresh token can still recover the session", async () => {
    mockGetValidatedSession.mockResolvedValue(null);
    mockHasRefreshTokenSessionCandidate.mockResolvedValue(true);

    await expect(requireDashboardSession()).resolves.toBeNull();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects to login when there is no recoverable session", async () => {
    mockGetValidatedSession.mockResolvedValue(null);
    mockHasRefreshTokenSessionCandidate.mockResolvedValue(false);

    await requireDashboardSession();

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});
