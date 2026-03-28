import { render, screen } from "@testing-library/react";
import { MarketingPage } from "@/features/landing/components/marketing-page";

describe("MarketingPage", () => {
  it("renders the landing page structure and safe marketing copy", () => {
    render(<MarketingPage />);

    const hasLink = (name: string, href: string) =>
      screen
        .getAllByRole("link", { name })
        .some((link) => link.getAttribute("href") === href);

    expect(
      screen.getByRole("heading", {
        name: /url intelligence, delivered as an api/i,
      }),
    ).toBeInTheDocument();

    expect(hasLink("Create account", "/register")).toBe(true);
    expect(hasLink("Login", "/login")).toBe(true);
    expect(hasLink("Product", "#product")).toBe(true);
    expect(hasLink("API shape", "#docs")).toBe(true);
    expect(hasLink("Pricing", "#pricing")).toBe(true);
    expect(hasLink("FAQ", "#faq")).toBe(true);

    expect(
      screen.getByRole("heading", {
        name: /a focused product for link-heavy experiences/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /see the response shape before you wire the ui/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /built for dashboard visibility/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pricing is framed for launch/i),
    ).toBeInTheDocument();

    expect(screen.queryByText(/SOC2/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/millions of requests per day/i),
    ).not.toBeInTheDocument();
  });
});
