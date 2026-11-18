import { summariseMonth } from "@web/app/(main)/(dashboard)/components/overview-series";
import type { Faq } from "@web/components/shared/page-faq";
import { getMonthlyRegistrationTotals } from "@web/queries/cars/monthly-registrations";

/** As deep as the hero reads, so "the most since" can reach as far back. */
const HISTORY_LIMIT = 360;

/**
 * The latest month in a sentence, e.g. "September 2026: 4,340 new cars
 * registered, up 6.2% on August; 38,120 so far in 2026." Leads the FAQ answer
 * on the pages that report monthly registrations.
 */
export async function loadLatestRegistrationsSummary(): Promise<
  string | undefined
> {
  const totals = await getMonthlyRegistrationTotals(HISTORY_LIMIT);
  const latest = totals.at(-1);
  if (!latest) {
    return undefined;
  }

  const year = latest.month.slice(0, 4);
  const yearToDate = totals
    .filter((row) => row.month.startsWith(year))
    .reduce((total, row) => total + row.total, 0);

  return summariseMonth(
    totals,
    latest.month,
    "new cars registered",
    `${yearToDate.toLocaleString("en-SG")} so far in ${year}`,
  );
}

/**
 * Questions people search about Singapore car registrations, worded the way
 * they search them. Shared by the accordion and the FAQPage schema so the two
 * always match. The first answer leads with `summary`, the latest month in a
 * sentence built from the same data as the page.
 */
export const buildCarsFaqs = (summary?: string): Faq[] => [
  {
    question: "How many new cars are registered in Singapore each month?",
    answer: `${summary ? `${summary} Source: LTA. ` : ""}The figures beside the trend chart give the number of new car registrations for the selected month, broken down below by fuel type, vehicle type and make, and the trend chart shows the months before. A car counts in the month it is registered.`,
  },
  {
    question:
      "What is the difference between new registrations and the vehicle population?",
    answer:
      "New registrations count the cars registered in a month. The vehicle population counts every vehicle on the road at 31 December, once a year, so its mix shifts far more slowly. The Cars on the road panel on this page gives the population.",
  },
  {
    question: "How are new car registrations counted?",
    answer:
      "A car counts in the month it is registered, under the fuel type and vehicle type LTA records against it. The figures are new registrations, not the vehicle population already on the road.",
  },
  {
    question: "Why do some months show higher car registrations?",
    answer:
      "Car registration patterns vary with COE price movements, new model launches, promotional periods by dealers, economic conditions and seasonal buying. Lower COE prices or attractive financing options typically lead to higher registrations.",
  },
  {
    question: "Can I see car registrations for an earlier month?",
    answer:
      "Yes. Use the Month select at the top of the page to switch to an earlier month, and the registration figures on the page follow it.",
  },
  {
    question: "Can I compare car registrations between two months?",
    answer:
      "Yes. The Compare two months section on this page lets you pick two months and see how registrations moved between them, by fuel type and by vehicle type.",
  },
  {
    question: "Where does this car registration data come from?",
    answer:
      "From Singapore's Land Transport Authority (LTA), through LTA DataMall. Registration data is updated monthly, following LTA's official data releases.",
  },
];
