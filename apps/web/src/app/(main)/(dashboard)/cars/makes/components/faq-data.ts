import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about car makes in Singapore, worded the way they
 * search them. Shared by the accordion and the FAQPage schema so the two always
 * match. Answers point to the figures on the page rather than quote them.
 */
export const MAKES_FAQS: Faq[] = [
  {
    question: "What is the most popular car brand in Singapore?",
    answer:
      "The leading make at the top of this page is the make with the most new car registrations in the selected range: this month, the year to date or the last 12 months. The All makes table ranks every other make below it.",
  },
  {
    question: "How many car makes are sold in Singapore?",
    answer:
      "The All makes table lists every make with new car registrations in the selected range, and its caption gives the count. Filter by fuel type to see only the makes selling, for example, electric cars.",
  },
  {
    question: "Are parallel-imported cars included?",
    answer:
      "Yes. Registrations are counted by make as recorded at registration, so rebadged and parallel-imported cars appear under the same name as authorised-dealer stock.",
  },
  {
    question: "Can I see car registrations by model?",
    answer:
      "No. LTA reports registrations by make, fuel type and vehicle type, not by model, so there are no model-level figures anywhere on the site.",
  },
  {
    question: "Which car makes sell only electric cars in Singapore?",
    answer:
      "The Electric-only makes section lists the makes selling only battery-electric cars, with their combined share of registrations.",
  },
];
