import { sortByName } from "@motormetrics/utils/sorting";
import {
  BookOpen,
  Calculator,
  Calendar,
  CarFront,
  FileMinus,
  FilePlus,
  Gauge,
  Gavel,
  LayoutGrid,
  type LucideIcon,
  Newspaper,
  PlugZap,
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
      title: "Vehicle population",
      url: "/cars/annual",
      icon: Calendar,
      description: "Yearly vehicle population and registration trends",
    },
  ],
  electric: [
    {
      title: "EV adoption",
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
      title: "COE results",
      url: "/coe/results",
      icon: Gavel,
      description: "Every exercise's premiums, trends and record highs",
    },
    {
      title: "PQP rates",
      url: "/coe/pqp",
      icon: Calculator,
      description: "Prevailing quota premiums and calculations",
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
    href: "/coe/results",
    label: "COE",
    sections: [{ label: "COE data", items: navLinks.coe }],
  },
  {
    href: "/cars",
    label: "Cars",
    // Electric leads: EVs are most new cars now, so they get the top of the
    // menu rather than a pill of their own.
    sections: [
      { label: "Electric", items: navLinks.electric },
      { label: "Vehicle data", items: navLinks.cars, withOverview: true },
      { label: "Tools", items: navLinks.tools },
    ],
  },
  { href: "/learn", label: "Learn" },
];

/** One labelled group of rows in the shell sidebar. */
export interface SidebarGroup {
  label: string;
  items: NavigationItem[];
}

/**
 * The shell sidebar, in Direction D's order: COE ahead of Cars, then the
 * calculators and the reading. Every row carries an icon, because the
 * collapsed sidebar shows icons only.
 */
export const SIDEBAR_GROUPS: readonly SidebarGroup[] = [
  {
    label: "Market",
    items: [{ title: "Market overview", url: "/", icon: LayoutGrid }],
  },
  {
    label: "COE",
    items: [...navLinks.coe],
  },
  {
    label: "Cars",
    items: [
      { title: "Cars overview", url: "/cars", icon: Gauge },
      ...navLinks.cars,
      ...navLinks.electric,
    ],
  },
  { label: "Tools", items: navLinks.tools },
  {
    label: "Learn",
    items: [
      { title: "Guides", url: "/learn", icon: BookOpen },
      { title: "Blog", url: "/blog", icon: Newspaper },
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
