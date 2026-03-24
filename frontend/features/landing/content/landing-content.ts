import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookText,
  Bot,
  Database,
  FileJson,
  Globe,
  KeyRound,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
};

export type AudienceItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type WorkflowStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type ComparisonRow = {
  feature: string;
  diy: string;
  metricdash: string;
};

export type PricingCard = {
  name: string;
  price: string;
  description: string;
  notes: string;
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  features: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const navItems: NavItem[] = [
  { href: "#product", label: "Product" },
  { href: "#workflow", label: "How it works" },
  { href: "#docs", label: "API shape" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export const audiences: AudienceItem[] = [
  {
    icon: MessageSquare,
    title: "Chat products",
    description:
      "Generate rich link cards inside conversations without building a scraping pipeline yourself.",
  },
  {
    icon: Bot,
    title: "Community platforms",
    description:
      "Enrich forum, feed, and moderation experiences with consistent metadata and safer caching behavior.",
  },
  {
    icon: Newspaper,
    title: "Publishing tools",
    description:
      "Support editors and CMS workflows with canonical links, preview content, and predictable output.",
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    icon: Globe,
    title: "Accept a URL",
    description:
      "Your app sends a URL to the metadata endpoint with a MetricDash API key.",
  },
  {
    icon: ShieldCheck,
    title: "Validate and protect",
    description:
      "MetricDash checks auth, validates the URL, and applies rate limiting before fetch.",
  },
  {
    icon: Database,
    title: "Cache and normalize",
    description:
      "Metadata is fetched, cleaned into a stable shape, and cached for repeat requests.",
  },
  {
    icon: FileJson,
    title: "Return JSON",
    description:
      "Your frontend or backend receives structured preview data plus cache context.",
  },
];

export const featureHighlights: FeatureItem[] = [
  {
    icon: Sparkles,
    title: "Clean preview responses",
    description:
      "Return a stable schema for title, description, image, favicon, content type, and cache status.",
  },
  {
    icon: Zap,
    title: "Fast cache hot path",
    description:
      "Lean on Redis-backed caching to keep repeated URL lookups responsive for product surfaces.",
  },
  {
    icon: KeyRound,
    title: "API key lifecycle",
    description:
      "Create, rotate, and revoke keys from the dashboard while keeping raw keys out of storage.",
  },
  {
    icon: BarChart3,
    title: "Usage visibility",
    description:
      "Track request volume and response health so teams can reason about adoption and cost.",
  },
  {
    icon: Workflow,
    title: "Reliable request flow",
    description:
      "Build on top of URL validation, request logging, retries, and predictable error handling.",
  },
  {
    icon: BookText,
    title: "Built for V1 product fit",
    description:
      "Focused on chat, community, and publishing apps instead of drifting into generic analytics.",
  },
];

export const comparisonRows: ComparisonRow[] = [
  {
    feature: "Metadata extraction edge cases",
    diy: "Handle source quirks yourself",
    metricdash: "Normalized into one response contract",
  },
  {
    feature: "Caching strategy",
    diy: "Design invalidation and TTL rules",
    metricdash: "Shared cache layer ready for preview traffic",
  },
  {
    feature: "API key security",
    diy: "Build generation, hashing, and revocation",
    metricdash: "Dashboard-driven key management",
  },
  {
    feature: "Usage and logs",
    diy: "Instrument and aggregate separately",
    metricdash: "Usage pages and request history in one place",
  },
  {
    feature: "V1 shipping speed",
    diy: "Weeks of infra work before polish",
    metricdash: "Start with one metadata workflow now",
  },
];

export const pricingCards: PricingCard[] = [
  {
    name: "Explore",
    price: "$0",
    description:
      "A simple starting point while MetricDash sharpens the V1 workflow.",
    notes:
      "Includes up to 10k monthly billable requests while teams validate preview quality and integration fit.",
    ctaLabel: "Create account",
    ctaHref: "/register",
    features: [
      "Access to the auth flow and dashboard shell",
      "API key creation for local and staging usage",
      "Early metadata response testing",
      "10k included billable requests each month",
      "Roadmap updates as V1 expands",
    ],
  },
  {
    name: "Build",
    price: "$0.60 / 1k",
    description:
      "Usage-based pricing once monthly included billable requests are exceeded.",
    notes:
      "Dashboard billing estimates are live in V1. Stripe collection and metering come later.",
    ctaLabel: "Open dashboard",
    ctaHref: "/dashboard",
    featured: true,
    features: [
      "Cache hits stay free under the launch model",
      "Usage trends and request log visibility",
      "Billing estimate surfaces in the dashboard",
      "Server-owned pricing model ready for Stripe later",
    ],
  },
  {
    name: "Scale",
    price: "Custom later",
    description:
      "A future path for products that need predictable quotas, integrations, and rollout support.",
    notes:
      "This track is roadmap-oriented and not advertised as generally available yet.",
    ctaLabel: "View API shape",
    ctaHref: "#docs",
    features: [
      "Custom rollout planning",
      "Domain-level analytics roadmap",
      "Refresh and reliability enhancements",
      "Collaboration on higher-volume needs",
    ],
  },
];

export const faqs: FaqItem[] = [
  {
    question: "What problem does MetricDash solve first?",
    answer:
      "V1 focuses on one sharp product: turning pasted URLs into reliable link previews for chat, community, and publishing apps without building the scraping, caching, usage tracking, and key management stack yourself.",
  },
  {
    question: "Is the response shape stable?",
    answer:
      "That is the goal of the metadata engine. The landing page showcases the normalized response contract described in the product direction so frontend and backend consumers can depend on a predictable shape.",
  },
  {
    question: "Does the dashboard already matter in V1?",
    answer:
      "Yes. The dashboard is part of the core loop because API keys, usage, and request logs help product teams understand how preview traffic behaves after integration.",
  },
  {
    question: "Is billing live today?",
    answer:
      "Billing estimates and the launch pricing model are live in the dashboard today. Stripe customer management, metered billing, and invoicing are intentionally deferred to a later phase.",
  },
];

export const requestExample = `GET /api/v1/metadata?url=https%3A%2F%2Fexample.com%2Farticle
Authorization: Bearer md_live_************************
Accept: application/json`;

export const responseExample = `{
  "url": "https://example.com/article",
  "canonical_url": "https://example.com/article",
  "title": "Example Title",
  "description": "Example description",
  "image": "https://example.com/image.jpg",
  "favicon": "https://example.com/favicon.ico",
  "site_name": "Example",
  "content_type": "article",
  "author": null,
  "published_at": null,
  "cache": {
    "hit": true,
    "ttl": 43200
  }
}`;
