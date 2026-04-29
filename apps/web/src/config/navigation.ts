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
  iconColor?: string;
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
      iconColor: "text-blue-500",
    },
    {
      title: "Deregistrations",
      url: "/cars/deregistrations",
      icon: FileMinus,
      description: "Monthly vehicle deregistration statistics",
      iconColor: "text-red-500",
    },
    {
      title: "Makes",
      url: "/cars/makes",
      icon: CarFront,
      description: "Car makes statistics and market share analysis",
      badge: "beta",
      iconColor: "text-pink-500",
      matchPrefix: true,
    },
    {
      title: "Fuel Types",
      url: "/cars/fuel-types",
      icon: Fuel,
      description: "Breakdown by petrol, diesel, hybrid and electric",
      iconColor: "text-green-500",
    },
    {
      title: "Vehicle Types",
      url: "/cars/vehicle-types",
      icon: Car,
      description: "Analysis of saloons, hatchbacks, SUVs and more",
      iconColor: "text-purple-500",
    },
    {
      title: "Annual",
      url: "/cars/annual",
      icon: Calendar,
      description: "Yearly vehicle population and registration trends",
      iconColor: "text-amber-500",
    },
    {
      title: "Electric Vehicles",
      url: "/cars/electric-vehicles",
      icon: Zap,
      description: "BEV, PHEV and hybrid adoption trends and market share",
      badge: "new",
      iconColor: "text-emerald-500",
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
      iconColor: "text-orange-500",
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

export const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/learn", label: "Learn" },
] as const satisfies readonly NavItem[];

export const POLAR_DONATION_URL = "https://polar.sh/motormetrics";
