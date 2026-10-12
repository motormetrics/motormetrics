import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about COE bidding, worded the way they search them.
 * Shared by the accordion and the FAQPage schema so the two always match. The
 * rules are LTA's; answers point to the results on the page rather than quote
 * them.
 */
export const COE_FAQS: Faq[] = [
  {
    question: "How often is COE bidding held?",
    answer:
      "Twice a month. LTA opens bidding at 12pm on the first Monday and third Monday of each month, and each exercise closes at 4pm on the third day. This page reports the latest exercise.",
  },
  {
    question: "How is the COE price decided?",
    answer:
      "The COE premium is the lowest successful bid in each category when the exercise closes, so everyone who wins pays the same price, whatever they bid.",
  },
  {
    question: "What is the difference between Cat A and Cat B?",
    answer:
      "Category A is for cars up to 1,600cc and 130bhp, or electric cars up to 110kW. Category B is for cars above 1,600cc or 130bhp, or electric cars above 110kW. In October 2026 LTA proposed merging the two; the category merger page explains the proposal.",
  },
  {
    question: "What are COE Categories C, D and E?",
    answer:
      "Category C is for goods vehicles and buses, and Category D for motorcycles. Category E is an open category that can be used for any vehicle type.",
  },
  {
    question: "How is the COE quota set?",
    answer:
      "LTA sets the quotas quarterly, from deregistrations and the allowed growth in the vehicle population. The Bids against quota section on this page sets each category's quota against the bids received in the exercise.",
  },
  {
    question: "Where do these COE results come from?",
    answer:
      "From Singapore's Land Transport Authority (LTA), through LTA DataMall, updated after each bidding exercise.",
  },
];
