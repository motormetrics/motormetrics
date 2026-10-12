import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about COE price history, worded the way they search
 * them. Shared by the accordion and the FAQPage schema so the two always match.
 * The rules are LTA's, as "How an exercise runs" on the page sets them out;
 * answers point to the results rather than quote them.
 */
export const RESULTS_FAQS: Faq[] = [
  {
    question: "What is the highest COE price ever?",
    answer:
      "The records table on this page lists the highest closing premium in each category across every exercise on record, with the exercise in which each record was set.",
  },
  {
    question: "What is the average COE price this year?",
    answer:
      "The By year table gives the mean of each year's exercises in every category, with the year's high. The current year is year to date, so it moves with each exercise.",
  },
  {
    question: "How often is COE bidding held?",
    answer:
      "Twice a month. LTA opens bidding at 12pm on the first Monday and third Monday of each month, and each exercise closes at 4pm on the third day.",
  },
  {
    question: "How is the COE premium decided?",
    answer:
      "The premium is the lowest successful bid in each category, so everyone who wins pays the same price, whatever they bid.",
  },
  {
    question: "What affects COE prices?",
    answer:
      "Supply and demand. Supply is the quota, which LTA sets quarterly from deregistrations and the allowed growth in the vehicle population. Demand moves with factors such as economic conditions and new model launches. The quota and demand section shows both for each exercise.",
  },
];
