import { slugify } from "@motormetrics/utils/slugify";
import type { Announcement, LinkItem } from "@web/types";
import { Battery, Droplet, Fuel, Zap } from "lucide-react";

// =============================================================================
// Brand Configuration
// =============================================================================
export const SITE_TITLE = "MotorMetrics";
export const SITE_DESCRIPTION =
  "Singapore vehicle market intelligence for COE, registrations, EV adoption, ownership costs, and policy shifts.";

// =============================================================================
// Domain & URLs
// =============================================================================
export const DOMAIN_NAME = "motormetrics.app";

// Site URL is set per environment via NEXT_PUBLIC_SITE_URL so each domain
// self-references (https://motormetrics.app in production, the generated
// deployment URL on previews, http://localhost:3000 locally).
// Falls back to the production domain when unset.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${DOMAIN_NAME}`;

export const LOGO_URL = `${SITE_URL}/apple-icon`;

export const SUPPORT_EMAIL = "support@motormetrics.app";
export const GITHUB_REPO_URL = "https://github.com/motormetrics/motormetrics";

// =============================================================================
// Feature Flags
// =============================================================================
export const FEATURE_FLAG_UNRELEASED =
  process.env.NEXT_PUBLIC_FEATURE_FLAG_UNRELEASED === "true";

// =============================================================================
// Data Constants (Fuel Types, Vehicle Types, etc.)
// =============================================================================
export const HYBRID_REGEX = /^(Diesel|Petrol)-(Electric)(\s\(Plug-In\))?$/;

export const FUEL_TYPE_LINKS: LinkItem[] = [
  {
    label: "Petrol",
    description: "Internal Combustion Engine (ICE) vehicles",
    icon: Fuel,
  },
  {
    label: "Petrol-Electric",
    description: "Petrol hybrid vehicles",
    icon: Zap,
  },
  {
    label: "Petrol-Electric (Plug-In)",
    description: "Plug-in petrol hybrid vehicles",
    icon: Zap,
  },
  {
    label: "Electric",
    description: "Battery Electric Vehicles (BEV)",
    icon: Battery,
  },
  {
    label: "Diesel",
    description: "Compression-ignition engine vehicles",
    icon: Droplet,
  },
  {
    label: "Diesel-Electric",
    description: "Diesel hybrid vehicles",
    icon: Zap,
  },
  {
    label: "Diesel-Electric (Plug-In)",
    description: "Plug-in diesel hybrid vehicles",
    icon: Zap,
  },
]
  .map((link) => ({
    ...link,
    href: `/cars/fuel-types/${slugify(link.label)}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// =============================================================================
// UI Constants
// =============================================================================
export const announcements: Announcement[] = [
  {
    content:
      "SG Cars Trends is now MotorMetrics. Please update your bookmark to motormetrics.app.",
  },
];

// =============================================================================
// Cache Keys
// =============================================================================
export const LAST_UPDATED_CARS_KEY = "last_updated:cars";
export const LAST_UPDATED_COE_KEY = "last_updated:coe";
