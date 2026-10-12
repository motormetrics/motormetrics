import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about COE premiums by category, worded the way they
 * search them. Shared by the accordion and the FAQPage schema so the two always
 * match. The rules are LTA's; answers point to the premiums on the page rather
 * than quote them.
 */
export const PREMIUMS_FAQS: Faq[] = [
  {
    question: "What is the COE premium for each category?",
    answer:
      "The All categories table on this page gives the closing premium, quota and bids for every category in the selected exercise. Select a row to chart that category's premium by exercise.",
  },
  {
    question: "What is a COE quota premium?",
    answer:
      "The quota premium is the price of a COE as set by the bidding exercise: the lowest successful bid in each category. Everyone who wins in that category pays it, whatever they bid.",
  },
  {
    question: "What is the difference between Cat A and Cat B?",
    answer:
      "Category A is for cars up to 1,600cc and 130bhp, or electric cars up to 110kW. Category B is for cars above 1,600cc or 130bhp, or electric cars above 110kW.",
  },
  {
    question: "What do COE Categories C, D and E cover?",
    answer:
      "Category C is for goods vehicles and buses, and Category D for motorcycles. Category E is an open category that can be used for any vehicle type.",
  },
  {
    question: "How often do COE premiums change?",
    answer:
      "With every bidding exercise, and LTA holds two a month: bidding opens at 12pm on the first Monday and third Monday of each month and closes at 4pm on the third day.",
  },
];
