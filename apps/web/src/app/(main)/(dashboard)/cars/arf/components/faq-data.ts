import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about the ARF, worded the way they search them.
 * Shared by the accordion and the FAQPage schema so the two always match. The
 * tiers are LTA's, as in `arf-rates`; every answer reports LTA's rules.
 */
export const ARF_FAQS: Faq[] = [
  {
    question: "What is ARF in Singapore?",
    answer:
      "The Additional Registration Fee (ARF) is a tax paid when a vehicle is first registered in Singapore. It is charged on the car's Open Market Value (OMV), the price before any Singapore taxes, in tiers that make higher-value cars proportionally more expensive.",
  },
  {
    question: "How is ARF calculated?",
    answer:
      "The OMV is split into bands, each charged at a higher rate. For cars with COEs from the 2nd bidding exercise of February 2023, LTA charges 100% on the first $20,000, 140% on the next $20,000, 190% on the next $20,000, 250% on the next $20,000 and 320% above $80,000.",
  },
  {
    question: "How much ARF is payable on a car with a $35,000 OMV?",
    answer:
      "Under the current tiers, $41,000: 100% of the first $20,000 is $20,000, and 140% of the remaining $15,000 is $21,000. Enter any OMV in the calculator above to see what each band adds.",
  },
  {
    question: "Which ARF rates apply to my car?",
    answer:
      "It depends on when the car's COE was obtained. LTA has applied three car schedules: one from February 2023, one from February 2022 to February 2023, and one before February 2022. The calculator lets you pick the schedule.",
  },
  {
    question: "Is ARF refundable?",
    answer:
      "Partly. Deregister a car within 10 years and you get a PARF rebate, a share of the ARF paid. For COEs from the 2nd bidding exercise of February 2026, it is 5% to 30% of ARF depending on the car's age, capped at $30,000; cars with earlier COEs keep the older rates.",
  },
  {
    question: "Does the ARF calculator include VES or EEAI?",
    answer:
      "No. Figures are for illustration only and are before any VES or EEAI rebate or surcharge.",
  },
];
