import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about one make, with its name in the wording they
 * search, such as "How many BMW cars are registered in Singapore?". Shared by
 * the accordion and the FAQPage schema so the two always match. Answers point
 * to the figures on the page rather than quote them, so they never go stale.
 */
export const buildMakeFaqs = (make: string): Faq[] => [
  {
    question: `How many ${make} cars are registered in Singapore?`,
    answer: `The headline at the top of this page counts new ${make} car registrations in Singapore for the selected period, from LTA data. Use the month picker to change the month the page reports.`,
  },
  {
    question: `What fuel types do ${make} cars in Singapore use?`,
    answer: `This page breaks ${make} registrations down by fuel type and by vehicle type, as LTA records them at registration, so you can see how many are petrol, hybrid or electric.`,
  },
  {
    question: `Are parallel-imported ${make} cars included?`,
    answer: `Yes. Registrations are counted by make as recorded at registration, so rebadged and parallel-imported ${make} cars appear under the same name as authorised-dealer stock.`,
  },
  {
    question: `Can I see ${make} registrations by model?`,
    answer:
      "No. LTA reports registrations by make, fuel type and vehicle type, not by model, so there are no model-level figures anywhere on the site.",
  },
  {
    question: `How do ${make} registrations compare with COE prices?`,
    answer: `The Registrations against COE premiums section charts ${make} registrations by month alongside the Category A and B premiums for the same months.`,
  },
];
