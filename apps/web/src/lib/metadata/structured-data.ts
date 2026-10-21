import { SITE_TITLE, SITE_URL } from "@web/config";
import type {
  BreadcrumbList,
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
