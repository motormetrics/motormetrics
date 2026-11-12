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
    answer: `${summary ? `${summary} Source: LTA. ` : ""}The headline at the top of this page gives the number of new car registrations for the selected month, and the trend chart beneath it shows the months before. A car counts in the month it is registered.`,
  },
  {
    question:
      "What is the difference between new registrations and the vehicle population?",
    answer:
      "New registrations count the cars registered in a month. The vehicle population counts every vehicle on the road at 31 December, once a year, so its mix shifts far more slowly. The Cars on the road panel on this page gives the population.",
  },
  {
    question: "Can I see car registrations for an earlier month?",
    answer:
      "Yes. Use the month picker at the top of the page to switch to an earlier month, and the registration figures on the page follow it.",
  },
  {
    question: "Where does this car registration data come from?",
    answer:
      "From Singapore's Land Transport Authority (LTA), through LTA DataMall. Registration data is updated monthly, following LTA's official data releases.",
  },
];
