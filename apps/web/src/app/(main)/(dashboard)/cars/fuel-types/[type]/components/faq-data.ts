import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about one fuel type, with its name in the wording
 * they search, such as "How many Electric cars are registered in Singapore?".
 * Shared by the accordion and the FAQPage schema so the two always match.
 * Answers point to the figures on the page rather than quote them, so they
 * never go stale.
 */
export const buildFuelTypeFaqs = (fuelType: string): Faq[] => [
  {
    question: `How many ${fuelType} cars are registered in Singapore?`,
    answer: `The headline on this page counts new car registrations recorded as ${fuelType} for the selected period: this month, the year to date or the last 12 months. It counts new registrations, not the ${fuelType} cars already on the road.`,
  },
  {
    question: `What share of new cars in Singapore are ${fuelType}?`,
    answer: `The share of registrations beside the headline gives ${fuelType} as a share of all new car registrations in the period. The month-by-month table gives the same share for each of the last 12 months.`,
  },
  {
    question: `Which car makes sell the most ${fuelType} cars in Singapore?`,
    answer: `The ${fuelType} by make table ranks the leading makes by ${fuelType} registrations in the period, with each make's share and its change against the same period a year earlier.`,
  },
  {
    question: `How does LTA decide a car is ${fuelType}?`,
    answer:
      "A car counts in the month it is registered, under the fuel type LTA records against it. LTA's own fuel types are kept unmerged here, so Petrol-Electric and Petrol-Electric (Plug-In) are counted separately.",
  },
];
