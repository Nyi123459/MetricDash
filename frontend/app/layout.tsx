import type { Metadata } from "next";
import { QueryProvider } from "@/common/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetricDash",
  description:
    "Link intelligence API for chat, community, and publishing products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
