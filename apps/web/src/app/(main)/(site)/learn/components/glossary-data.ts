// Data extracted from glossary-section.tsx because "use client" modules
// don't expose non-component exports to Server Components.

import type { LucideIcon } from "lucide-react";
import { BookOpen, Car, Landmark, Layers, TrendingUp } from "lucide-react";

interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface GlossaryCategoryData {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  terms: GlossaryTerm[];
}

export const GLOSSARY_CATEGORIES: GlossaryCategoryData[] = [
  {
    title: "Core Terms",
    icon: BookOpen,
    iconColor: "text-primary",
    terms: [
      {
        term: "COE",
        definition:
          "Certificate of Entitlement — a quota licence required to register a vehicle in Singapore, valid for 10 years.",
      },
      {
        term: "PQP",
        definition:
          "Prevailing Quota Premium — the moving average of COE prices used to calculate COE renewal costs after 10 years.",
      },
      {
        term: "PARF",
        definition:
          "Preferential Additional Registration Fee — a rebate given when deregistering a vehicle before its COE expires, calculated as a percentage of the ARF paid.",
      },
      {
        term: "ARF",
        definition:
          "Additional Registration Fee — a tax levied on top of the vehicle's Open Market Value at registration. The rate is tiered based on OMV.",
      },
      {
        term: "OMV",
        definition:
          "Open Market Value — the price of a vehicle before any Singapore-specific taxes, assessed by Singapore Customs.",
      },
      {
        term: "Road Tax",
        definition:
          "An annual tax based on engine capacity (for ICE vehicles) or power output (for EVs), payable to renew the vehicle's road usage rights.",
      },
    ],
  },
  {
    title: "COE Categories",
    icon: Layers,
    iconColor: "text-warning",
    terms: [
      {
        term: "Category A",
        definition:
          "Cars up to 1,600cc and 130bhp, or electric cars with power up to 110kW.",
      },
      {
        term: "Category B",
        definition:
          "Cars above 1,600cc or 130bhp, or electric cars with power above 110kW.",
      },
      {
        term: "Category C",
        definition: "Goods vehicles and buses.",
      },
      {
        term: "Category D",
        definition: "Motorcycles.",
      },
      {
        term: "Category E",
        definition:
          "Open category — can be used for any vehicle type. Typically attracts the highest premiums.",
      },
    ],
  },
  {
    title: "Vehicle Types",
    icon: Car,
    iconColor: "text-success",
    terms: [
      {
        term: "BEV",
        definition:
          "Battery Electric Vehicle — powered entirely by an electric motor and battery, with zero tailpipe emissions.",
      },
      {
        term: "PHEV",
        definition:
          "Plug-in Hybrid Electric Vehicle — has both an electric motor and internal combustion engine, with a battery that can be charged externally.",
      },
      {
        term: "HEV",
        definition:
          "Hybrid Electric Vehicle — combines an internal combustion engine with an electric motor but cannot be plugged in to charge.",
      },
    ],
  },
  {
    title: "Regulatory Bodies and Schemes",
    icon: Landmark,
    iconColor: "text-secondary",
    terms: [
      {
        term: "LTA",
        definition:
          "Land Transport Authority — the government agency responsible for planning, operating, and maintaining Singapore's land transport infrastructure and systems.",
      },
      {
        term: "VQS",
        definition:
          "Vehicle Quota System — the overall system that controls vehicle population growth in Singapore through COE quotas.",
      },
      {
        term: "VES",
        definition:
          "Vehicular Emissions Scheme — a scheme that provides rebates or surcharges based on a vehicle's emissions, encouraging cleaner vehicles.",
      },
      {
        term: "CEVS",
        definition:
          "Carbon Emissions-based Vehicle Scheme — the predecessor to VES, which provided rebates or surcharges based on carbon emissions alone.",
      },
      {
        term: "ERP",
        definition:
          "Electronic Road Pricing — a congestion pricing system that charges motorists for using certain roads during peak hours.",
      },
    ],
  },
  {
    title: "Market Terms",
    icon: TrendingUp,
    iconColor: "text-primary",
    terms: [
      {
        term: "Quota Premium",
        definition:
          "The price of a COE as determined by the bidding exercise — the lowest successful bid in each category.",
      },
      {
        term: "Deregistration",
        definition:
          "The process of removing a vehicle from the Singapore register, either for export, scrappage, or to claim PARF/COE rebates.",
      },
      {
        term: "Parallel Import",
        definition:
          "Vehicles imported by dealers other than the official authorised distributor, often at competitive prices.",
      },
      {
        term: "Paper Bid",
        definition:
          "A pre-bidding COE commitment made through authorised dealers before the actual bidding exercise.",
      },
    ],
  },
];
