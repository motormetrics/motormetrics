import { sortByName } from "@motormetrics/utils/sorting";
import {
  BarChart3,
  Calculator,
  Calendar,
  Car,
  CarFront,
  FileMinus,
  FilePlus,
  Fuel,
  type LucideIcon,
  PlugZap,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Route } from "next";
import type { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaTelegram, FaXTwitter } from "react-icons/fa6";

export interface NavigationItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  description?: string;
  badge?: "beta" | "new";
}

export interface SocialMedia {
  title: string;
  url: string;
  icon: IconType;
}

export interface NavLinks {
  cars: NavigationItem[];
  coe: NavigationItem[];
  socialMedia: SocialMedia[];
}

const socialMedia: SocialMedia[] = [
  {
    title: "Instagram",
    url: "/instagram",
    icon: FaInstagram,
  },
  {
    title: "Telegram",
    url: "/telegram",
    icon: FaTelegram,
  },
  {
    title: "GitHub",
    url: "/github",
    icon: FaGithub,
  },
  {
    title: "X",
    url: "/x",
    icon: FaXTwitter,
  },
];

export const navLinks: NavLinks = {
  cars: [
    {
      title: "New Registrations",
      url: "/cars/registrations",
      icon: FilePlus,
      description: "Monthly car registration statistics and trends",
    },
    {
      title: "Deregistrations",
      url: "/cars/deregistrations",
      icon: FileMinus,
      description: "Monthly vehicle deregistration statistics",
    },
    {
      title: "Makes",
      url: "/cars/makes",
      icon: CarFront,
      description: "Car makes statistics and market share analysis",
      badge: "beta",
    },
    {
      title: "Fuel Types",
      url: "/cars/fuel-types",
      icon: Fuel,
      description: "Breakdown by petrol, diesel, hybrid and electric",
    },
    {
      title: "Vehicle Types",
      url: "/cars/vehicle-types",
      icon: Car,
      description: "Analysis of saloons, hatchbacks, SUVs and more",
    },
    {
      title: "Annual",
      url: "/cars/annual",
      icon: Calendar,
      description: "Yearly vehicle population and registration trends",
    },
    {
      title: "Electric Vehicles",
      url: "/cars/electric-vehicles",
      icon: Zap,
      description: "BEV, PHEV and hybrid adoption trends and market share",
      badge: "new",
    },
    {
      title: "EV Charging",
      url: "/cars/electric-vehicles/charging",
      icon: PlugZap,
      description: "Live charger availability, prices and busy hours",
      badge: "new",
    },
    {
      title: "PARF Calculator",
      url: "/cars/parf",
      icon: Calculator,
      description: "Calculate PARF rebate under old and new rates",
      badge: "new",
    },
    {
      title: "ARF Calculator",
      url: "/cars/arf",
      icon: Calculator,
      description: "Calculate ARF from a car's OMV",
      badge: "new",
    },
  ],
  coe: [
    {
      title: "Premiums",
      url: "/coe/premiums",
      icon: BarChart3,
      description: "Latest COE premiums and quick insights",
    },
    {
      title: "Results",
      url: "/coe/results",
      icon: TrendingUp,
      description: "Historical trends and bidding results",
    },
    {
      title: "PQP Rates",
      url: "/coe/pqp",
      icon: Calculator,
      description: "Prevailing quota premiums and calculations",
    },
  ],
  socialMedia: sortByName(socialMedia, { sortKey: "title" }),
};

export type NavItem = {
  href: Route;
  label: string;
  /**
   * Pages inside this section. A pill with items opens a dropdown listing them
   * (plus a link back to `href`); a pill without items is a plain link.
   */
  items?: NavigationItem[];
  /**
   * Eyebrow above `items` in the dropdown. Names what the group is rather than
   * repeating the pill, which already sits directly above it.
   */
  sectionLabel?: string;
};

/** Pills in the shell navigation, in comp order. */
export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Overview" },
  {
    href: "/cars",
    label: "Cars",
    items: navLinks.cars,
    sectionLabel: "Vehicle data",
  },
  { href: "/coe", label: "COE", items: navLinks.coe, sectionLabel: "COE data" },
  { href: "/cars/electric-vehicles", label: "Electric" },
  { href: "/learn", label: "Learn" },
];

/** Eyebrow above MORE_NAV_ITEMS, matching `sectionLabel` on the pills. */
export const MORE_NAV_SECTION_LABEL = "About this site";

/**
 * Everything the pills do not surface, behind the shell nav's "More" menu. The
 * Cars and COE sections are not listed here because their own pills open them.
 */
export const MORE_NAV_ITEMS: NavigationItem[] = [
  { title: "About", url: "/about" },
];

/** Shown in More when the `advertise-nav` flag is on. */
export const ADVERTISE_MORE_ITEM: NavigationItem = {
  title: "Advertise",
  url: "/advertise",
};

/** Shown in More when the `blog-nav` flag is on. `/blog` stays live either way. */
export const BLOG_MORE_ITEM: NavigationItem = {
  title: "Blog",
  url: "/blog",
};

export const FOOTER_NAV_ITEMS = [
  { href: "/about", label: "About" },
  { href: "/learn", label: "Learn" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/legal/terms-of-service", label: "Terms" },
] as const satisfies readonly NavItem[];

/** Inserted after Learn when the `advertise-nav` flag is on. */
export const ADVERTISE_FOOTER_ITEM = {
  href: "/advertise",
  label: "Advertise",
} as const satisfies NavItem;
