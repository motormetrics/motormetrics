import { SITE_TITLE, SITE_URL } from "@web/config";
import type {
  BreadcrumbList,
  DataCatalog,
  Dataset,
  DefinedTermSet,
  FAQPage,
  ItemList,
  WebPage,
  WithContext,
} from "schema-dts";

export function createWebPageStructuredData(
  title: string,
  description: string,
  path: string,
): WithContext<WebPage> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}${path}`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };
}

// --- Dataset schema ---

const datasetBase = {
  creator: {
    "@type": "Organization" as const,
    name: SITE_TITLE,
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization" as const,
    name: SITE_TITLE,
    url: SITE_URL,
  },
  provider: {
    "@type": "Organization" as const,
    name: "Land Transport Authority",
    url: "https://www.lta.gov.sg",
    description: "Singapore's transport regulatory authority",
  },
  spatialCoverage: {
    "@type": "Place" as const,
    name: "Singapore",
    geo: {
      "@type": "GeoCoordinates" as const,
      latitude: 1.3521,
      longitude: 103.8198,
    },
  },
  license:
    "https://www.lta.gov.sg/content/ltagov/en/footer/data-gov-sg-terms-of-use.html",
  measurementTechnique: "Official government vehicle registration records",
} as const;

type DatasetType =
  | "registrations"
  | "coe-results"
  | "coe-premiums"
  | "coe-pqp"
  | "deregistrations"
  | "annual"
  | "electric-vehicles";

interface DatasetConfig {
  name: string;
  description: string;
  path: string;
  temporalCoverage: string;
  variableMeasured: string[];
  distribution?: { encodingFormat: string; contentUrl: string }[];
}

const DATASET_CONFIGS: Record<DatasetType, DatasetConfig> = {
  registrations: {
    name: "Singapore Car Registration Data",
    description:
      "Comprehensive monthly vehicle registration statistics for Singapore, including breakdowns by manufacturer, fuel type, and vehicle category. Data sourced from Singapore's Land Transport Authority (LTA).",
    path: "/cars/registrations",
    temporalCoverage: "2020-01/..",
    variableMeasured: [
      "Vehicle registrations by month",
      "Market share by manufacturer",
      "Fuel type distribution",
      "Vehicle category breakdown",
    ],
    distribution: [
      {
        encodingFormat: "application/json",
        contentUrl: `${SITE_URL}/api/cars/registrations`,
      },
    ],
  },
  "coe-results": {
    name: "Singapore COE Bidding Results",
    description:
      "Historical Certificate of Entitlement (COE) bidding results for Singapore, including quota premiums across all vehicle categories (A, B, C, D, E) from twice-monthly exercises.",
    path: "/coe/results",
    temporalCoverage: "2020-01/..",
    variableMeasured: [
      "COE quota premium by category",
      "Bids received per exercise",
      "Quota available per category",
      "Bidding exercise results",
    ],
    distribution: [
      {
        encodingFormat: "application/json",
        contentUrl: `${SITE_URL}/api/coe`,
      },
    ],
  },
  "coe-premiums": {
    name: "Singapore COE Premium Trends",
    description:
      "COE premium price trends across all vehicle categories in Singapore, tracking how Certificate of Entitlement prices change over time.",
    path: "/coe/premiums",
    temporalCoverage: "2020-01/..",
    variableMeasured: [
      "COE premium price by category",
      "Premium price trends over time",
      "Category price comparisons",
    ],
  },
  "coe-pqp": {
    name: "Singapore Prevailing Quota Premium (PQP) Rates",
    description:
      "Historical PQP rates used for COE renewal in Singapore. The PQP is the moving average of COE prices, determining the cost to extend a vehicle's COE beyond 10 years.",
    path: "/coe/pqp",
    temporalCoverage: "2020-01/..",
    variableMeasured: [
      "PQP rate by vehicle category",
      "PQP rate trends over time",
    ],
  },
  deregistrations: {
    name: "Singapore Vehicle Deregistration Statistics",
    description:
      "Monthly vehicle deregistration data for Singapore, showing vehicles removed from the register through scrappage, export, or COE expiry, broken down by vehicle type.",
    path: "/cars/deregistrations",
    temporalCoverage: "2020-01/..",
    variableMeasured: [
      "Total deregistrations by month",
      "Deregistrations by vehicle type",
      "Deregistration trends over time",
    ],
  },
  annual: {
    name: "Singapore Annual Vehicle Population",
    description:
      "Yearly vehicle population statistics for Singapore, tracking the total number of registered vehicles by fuel type and manufacturer over time.",
    path: "/cars/annual",
    temporalCoverage: "2020/..",
    variableMeasured: [
      "Total vehicle population by year",
      "Vehicle population by fuel type",
      "Vehicle population by manufacturer",
    ],
  },
  "electric-vehicles": {
    name: "Singapore Electric Vehicle Registration Trends",
    description:
      "Electric vehicle (EV) registration statistics for Singapore, tracking BEV, PHEV, and hybrid adoption trends including monthly registrations and market share.",
    path: "/cars/electric-vehicles",
    temporalCoverage: "2020-01/..",
    variableMeasured: [
      "EV registrations by month",
      "EV market share percentage",
      "BEV vs PHEV vs HEV breakdown",
      "EV adoption growth rate",
    ],
  },
};

/**
 * Generate Dataset schema for a specific data type.
 * Used for Google Dataset Search visibility.
 */
export function generateDatasetSchema(type: DatasetType): Dataset {
  const config = DATASET_CONFIGS[type];
  return {
    "@type": "Dataset",
    name: config.name,
    description: config.description,
    url: `${SITE_URL}${config.path}`,
    ...datasetBase,
    temporalCoverage: config.temporalCoverage,
    variableMeasured: config.variableMeasured,
    ...(config.distribution && {
      distribution: config.distribution.map((d) => ({
        "@type": "DataDownload" as const,
        ...d,
      })),
    }),
  };
}

// --- FAQPage schema ---

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  items: FAQItem[];
}

/**
 * Generate FAQPage schema from FAQ sections.
 * Eligible for Google FAQ rich snippets in SERPs.
 */
export function generateFAQPageSchema(sections: FAQSection[]): FAQPage {
  return {
    "@type": "FAQPage",
    mainEntity: sections.flatMap((section) =>
      section.items.map(({ question, answer }) => ({
        "@type": "Question" as const,
        name: question,
        acceptedAnswer: { "@type": "Answer" as const, text: answer },
      })),
    ),
  };
}

// --- DefinedTermSet schema ---

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryCategory {
  terms: GlossaryTerm[];
}

/**
 * Generate DefinedTermSet schema from glossary categories.
 * Improves AI search citability for terminology.
 */
export function generateDefinedTermSetSchema(
  categories: GlossaryCategory[],
): DefinedTermSet {
  return {
    "@type": "DefinedTermSet",
    name: "Singapore Automotive Terms",
    description:
      "Key terms and definitions for Singapore's vehicle market, including COE, PARF, and vehicle classification terminology",
    hasDefinedTerm: categories.flatMap((category) =>
      category.terms.map(({ term, definition }) => ({
        "@type": "DefinedTerm" as const,
        name: term,
        description: definition,
        inDefinedTermSet: "Singapore Automotive Terms",
      })),
    ),
  };
}

// --- DataCatalog schema ---

/**
 * Generate DataCatalog schema for hub pages that link to multiple datasets.
 * Groups datasets under a single catalogue in Google Dataset Search.
 */
export function generateDataCatalogSchema(
  name: string,
  description: string,
  path: string,
  datasetTypes: DatasetType[],
): DataCatalog {
  return {
    "@type": "DataCatalog",
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { "@type": "Organization", name: SITE_TITLE, url: SITE_URL },
    dataset: datasetTypes.map((type) => {
      const config = DATASET_CONFIGS[type];
      return {
        "@type": "Dataset" as const,
        name: config.name,
        url: `${SITE_URL}${config.path}`,
      };
    }),
  };
}

// --- ItemList schema ---

interface ListItem {
  name: string;
  url: string;
}

/**
 * Generate ItemList schema for listing pages.
 * Eligible for Google carousel/list rich results.
 */
export function generateItemListSchema(
  name: string,
  items: ListItem[],
): ItemList {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

// --- BreadcrumbList schema ---

interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * Generate BreadcrumbList schema for hierarchical navigation.
 * Google renders clickable breadcrumb trails in SERPs.
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
): BreadcrumbList {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
