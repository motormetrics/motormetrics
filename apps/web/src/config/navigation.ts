import { sortByName } from "@motormetrics/utils/sorting";
import {
  BookOpen,
  Calculator,
  Calendar,
  Car,
  CarFront,
  FileMinus,
  FilePlus,
  Fuel,
  Gavel,
  LayoutGrid,
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
  electric: NavigationItem[];
  tools: NavigationItem[];
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
      title: "New registrations",
      url: "/cars",
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
      title: "Fuel types",
      url: "/cars/fuel-types",
      icon: Fuel,
      description: "Breakdown by petrol, diesel, hybrid and electric",
    },
    {
      title: "Vehicle types",
      url: "/cars/vehicle-types",
      icon: Car,
      description: "Analysis of saloons, hatchbacks, SUVs and more",
    },
    {
      title: "Vehicle population",
      url: "/cars/annual",
      icon: Calendar,
      description: "Yearly vehicle population and registration trends",
    },
  ],
  electric: [
    {
      title: "Electric vehicles",
      url: "/cars/electric-vehicles",
      icon: Zap,
      description: "BEV, PHEV and hybrid adoption trends and market share",
      badge: "new",
    },
    {
      title: "EV charging",
      url: "/cars/electric-vehicles/charging",
      icon: PlugZap,
      description: "Live charger availability, prices and busy hours",
      badge: "new",
    },
  ],
  tools: [
    {
      title: "PARF calculator",
      url: "/cars/parf",
      icon: Calculator,
      description: "PARF rebate, COE rebate and deregistration value",
      badge: "new",
    },
    {
      title: "ARF calculator",
      url: "/cars/arf",
      icon: Calculator,
      description: "Calculate ARF from a car's OMV",
      badge: "new",
    },
  ],
  coe: [
    {
      title: "PQP rates",
      url: "/coe/pqp",
      icon: Calculator,
      description: "Prevailing quota premiums and calculations",
    },
    {
      title: "Premium history",
      url: "/coe/results",
      icon: TrendingUp,
      description: "COE prices by year, trends and record highs",
    },
  ],
  socialMedia: sortByName(socialMedia, { sortKey: "title" }),
};

/** One labelled group of rows in a pill's dropdown. */
export interface NavSection {
  /**
   * Eyebrow above the rows. Names what the group is rather than repeating the
   * pill, which already sits directly above it.
   */
  label: string;
  items: NavigationItem[];
  /** Leads this group with the pill's own "Overview" row. */
  withOverview?: boolean;
}

export type NavItem = {
  href: Route;
  label: string;
  /**
   * Pages inside this section. A pill with sections opens a dropdown listing
   * them; a pill without sections is a plain link.
   */
  sections?: NavSection[];
};

/**
 * Pills in the shell navigation, in comp order. COE leads Cars: COE and PQP
 * pages draw the most search traffic, so they come first.
 */
export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Overview" },
  {
    href: "/coe",
    label: "COE",
    sections: [{ label: "COE data", items: navLinks.coe, withOverview: true }],
  },
  {
    href: "/cars",
    label: "Cars",
    // Electric leads: EVs are most new cars now, so they get the top of the
    // menu rather than a pill of their own.
    sections: [
      { label: "Electric", items: navLinks.electric },
      { label: "Vehicle data", items: navLinks.cars },
      { label: "Tools", items: navLinks.tools },
    ],
  },
  { href: "/learn", label: "Learn" },
];

/** One labelled group of rows in the shell sidebar. */
export interface SidebarGroup {
  label: string;
  /** Drawn beside the group label, or on the row itself in a one-row group. */
  icon: LucideIcon;
  items: { title: string; url: string }[];
}

/**
 * The shell sidebar: COE ahead of Cars, then the calculators and the reading.
 * Labels are LTA's own terms. A group with one row drops its label and the
 * row carries the group's icon instead.
 */
export const SIDEBAR_GROUPS: readonly SidebarGroup[] = [
  {
    label: "Market",
    icon: LayoutGrid,
    items: [{ title: "Market overview", url: "/" }],
  },
  {
    label: "COE",
    icon: Gavel,
    items: [
      { title: "Bidding results", url: "/coe" },
      { title: "Premium history", url: "/coe/results" },
      { title: "PQP rates", url: "/coe/pqp" },
    ],
  },
  {
    label: "Cars",
    icon: CarFront,
    items: [
      { title: "New registrations", url: "/cars" },
      { title: "Deregistrations", url: "/cars/deregistrations" },
      { title: "Makes", url: "/cars/makes" },
      { title: "Electric vehicles", url: "/cars/electric-vehicles" },
      { title: "EV charging", url: "/cars/electric-vehicles/charging" },
      { title: "Vehicle population", url: "/cars/annual" },
    ],
  },
  {
    label: "Tools",
    icon: Calculator,
    items: [
      { title: "PARF calculator", url: "/cars/parf" },
      { title: "ARF calculator", url: "/cars/arf" },
    ],
  },
  {
    label: "Learn",
    icon: BookOpen,
    items: [
      { title: "Guides", url: "/learn" },
      { title: "Blog", url: "/blog" },
    ],
  },
];

export const FOOTER_NAV_ITEMS = [
  { href: "/about", label: "About" },
  { href: "/learn", label: "Learn" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/legal/terms-of-service", label: "Terms" },
] as const satisfies readonly NavItem[];
