import {
  type IconType,
  SiGithub,
  SiInstagram,
  SiTelegram,
  // SiThreads,
} from "@icons-pack/react-simple-icons";
import { sortByName } from "@motormetrics/utils";
import {
  BarChart3,
  BookOpen,
  Calculator,
  Calendar,
  Car,
  CarFront,
  FileMinus,
  FilePlus,
  FileText,
  Fuel,
  LayoutDashboard,
  type LucideIcon,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Route } from "next";

export interface NavigationItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  description?: string;
  show?: boolean;
  badge?: "beta" | "new";
  matchPrefix?: boolean;
}

export interface SocialMedia {
  title: string;
  url: string;
  icon: IconType;
}

export interface NavLinks {
  cars: NavigationItem[];
  coe: NavigationItem[];
  general: NavigationItem[];
  socialMedia: SocialMedia[];
}

export interface NavigationSection {
  name: string;
  href: string;
  icon: LucideIcon;
  children: NavigationItem[];
}

const socialMedia: SocialMedia[] = [
  {
    title: "Instagram",
    url: "/instagram",
    icon: SiInstagram,
  },
  // {
  //   title: "Threads",
  //   url: "/threads",
  //   icon: SiThreads,
  // },
  {
    title: "Telegram",
    url: "/telegram",
    icon: SiTelegram,
  },
  {
    title: "GitHub",
    url: "/github",
    icon: SiGithub,
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
      matchPrefix: true,
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
      title: "PARF Calculator",
      url: "/cars/parf",
      icon: Calculator,
      description: "Calculate PARF rebate under old and new rates",
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
  general: [
    {
      title: "Blog",
      url: "/blog",
      icon: FileText,
      description: "Insights and analysis on Singapore's car market",
      show: true,
    },
    {
      title: "Learn",
      url: "/learn",
      icon: BookOpen,
      description:
        "Educational hub with FAQs, glossary, guides and data sources",
      show: true,
    },
  ],
  socialMedia: sortByName(socialMedia, { sortKey: "title" }),
};

const dashboardItems: NavigationItem[] = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
];

export const navigationSections: NavigationSection[] = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    children: dashboardItems,
  },
  { name: "Cars", href: "/cars", icon: Car, children: navLinks.cars },
  { name: "COE", href: "/coe", icon: BarChart3, children: navLinks.coe },
];

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
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/legal/terms-of-service", label: "Terms" },
] as const satisfies readonly NavItem[];

/** Inserted after Learn when the `advertise-nav` flag is on. */
export const ADVERTISE_FOOTER_ITEM = {
  href: "/advertise",
  label: "Advertise",
} as const satisfies NavItem;
