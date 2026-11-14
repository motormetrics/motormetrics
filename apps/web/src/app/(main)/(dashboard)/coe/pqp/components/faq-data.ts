import type { Faq } from "@web/components/shared/page-faq";

/** The month's published rates, as the page's headline reports them. */
export interface PqpFaqRates {
  /** "November 2026" */
  month: string;
  /** Formatted amounts, e.g. "$129,883". */
  categoryA: string;
  categoryB: string;
  categoryA5Year: string;
  categoryB5Year: string;
}

/**
 * Questions people search about the PQP and COE renewal, worded the way they
 * search them. Shared by the accordion and the FAQPage schema so the two always
 * match. The rules are LTA's. The rates answer quotes the month's figures from
 * the same data as the headline, so it is a complete answer on its own and
 * changes with every publication; without rates it points to the page. This
 * page reports Categories A and B only.
 */
export const buildPqpFaqs = (rates?: PqpFaqRates): Faq[] => [
  {
    question: "What is the PQP?",
    answer:
      "The Prevailing Quota Premium (PQP) is the price of renewing a COE when its first 10 years end. Paying it renews the COE for another 5 or 10 years instead of deregistering the car.",
  },
  {
    question: "How is the PQP calculated?",
    answer:
      "LTA averages the closing premiums in the category over the last three months, across both exercises, and publishes it as the rate for the coming month. It therefore lags the market rather than leading it.",
  },
  {
    question: "How much is the PQP for Cat A and Cat B?",
    answer: rates
      ? `For ${rates.month}, LTA's PQP is ${rates.categoryA} for Category A and ${rates.categoryB} for Category B. A 5-year renewal costs half the PQP: ${rates.categoryA5Year} for Category A and ${rates.categoryB5Year} for Category B.`
      : "The headline and the published rates table on this page give the current month's PQP for Category A and Category B, with the change on the month before. A 5-year renewal costs half the PQP.",
  },
  {
    question: "Is there a PQP for Category E?",
    answer:
      "No. This page lists the PQP for Categories A and B only, and there is no PQP for Category E.",
  },
  {
    question: "Should I renew my COE or bid for a new one?",
    answer:
      "Renewing gives price certainty: the PQP is published before the month starts, while a bid is settled only when the exercise closes. But the car loses its PARF rebate on renewal, so it carries no PARF value at deregistration. The chart on this page sets each PQP against the latest closing premium.",
  },
  {
    question: "Can I renew my COE again after a 5-year renewal?",
    answer:
      "No. A 5-year renewal is final, and the car must be deregistered at the end of it.",
  },
];
