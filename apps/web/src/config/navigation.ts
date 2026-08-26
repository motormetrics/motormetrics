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
  DollarSign,
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
    {
      title: "Cost Breakdown",
      url: "/cars/costs",
      icon: DollarSign,
      description:
        "See how new car prices are composed — OMV, ARF, VES, and COE",
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
};

/** Pills in the shell navigation, in comp order. */
export const PRIMARY_NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/cars", label: "Cars" },
  { href: "/coe", label: "COE" },
  { href: "/cars/electric-vehicles", label: "Electric" },
  { href: "/learn", label: "Learn" },
] as const satisfies readonly NavItem[];

export interface NavGroup {
  title: string;
  items: NavigationItem[];
}

/**
 * Everything the pills do not surface, grouped behind the shell nav's "More"
 * menu. Electric is omitted because it has its own pill.
 */
export const MORE_NAV_GROUPS: NavGroup[] = [
  {
    title: "Cars",
    items: navLinks.cars.filter(({ url }) => url !== "/cars/electric-vehicles"),
  },
  { title: "COE", items: navLinks.coe },
  {
    title: "Company",
    items: [
      { title: "About", url: "/about" },
      { title: "Advertise", url: "/advertise" },
      // TODO: Blog hidden from site navigation pending a decision on the blog's
      // future. Commented out rather than deleted so it can be restored in one
      // line. The /blog route, sitemap entries and llms.txt are all still live.
      // { title: "Blog", url: "/blog" },
    ],
  },
];

export const FOOTER_NAV_ITEMS = [
  { href: "/about", label: "About" },
  { href: "/learn", label: "Learn" },
  { href: "/advertise", label: "Advertise" },
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/legal/terms-of-service", label: "Terms" },
] as const satisfies readonly NavItem[];
