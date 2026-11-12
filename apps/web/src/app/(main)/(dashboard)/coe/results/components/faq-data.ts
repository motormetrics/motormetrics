import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  COE_CATEGORIES,
  type CoeExercise,
  formatExercise,
  recordHighs,
  summariseByYear,
  summariseYears,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { Faq } from "@web/components/shared/page-faq";

/** "First bidding, October 2023" mid-sentence: only the ordinal drops its capital. */
const lowerFirst = (text: string) =>
  text.charAt(0).toLowerCase() + text.slice(1);

/** "Cat A $106,000 (first bidding, October 2023); Cat B …" */
const recordsLine = (exercises: CoeExercise[]): string | undefined => {
  const highs = recordHighs(exercises);
  const records = COE_CATEGORIES.flatMap((category) => {
    const exercise = highs[category];
    const premium = exercise?.results[category]?.premium;
    return exercise && premium !== undefined
      ? [
          `${category.replace("Category", "Cat")} ${formatCurrency(premium)} (${lowerFirst(formatExercise(exercise))})`,
        ]
      : [];
  });

  return records.length > 0
    ? `Record closing premiums, from LTA results: ${records.join("; ")}.`
    : undefined;
};

/**
 * Questions people search about COE price history, worded the way they search
 * them. Shared by the accordion and the FAQPage schema so the two always match.
 * The rules are LTA's, as "How an exercise runs" on the page sets them out.
 * The records and yearly-average answers lead with the figures, built from the
 * same exercises as the tables, so each is a complete answer on its own and
 * changes with every result. Takes the exercises oldest first.
 */
export const buildResultsFaqs = (exercises: CoeExercise[]): Faq[] => {
  const records = recordsLine(exercises);
  const averages = summariseYears(summariseByYear(exercises));

  return [
    {
      question: "What is the highest COE price ever?",
      answer: `${records ? `${records} ` : ""}The records table on this page lists the highest closing premium in each category across every exercise on record, with the exercise in which each record was set.`,
    },
    {
      question: "What is the average COE price this year?",
      answer: `${averages ? `${averages} ` : ""}The By year table gives the mean of each year's exercises in every category, with the year's high. The current year is year to date, so it moves with each exercise.`,
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
};
