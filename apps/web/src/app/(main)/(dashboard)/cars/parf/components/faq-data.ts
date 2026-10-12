import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about the PARF rebate, worded the way they search
 * them. Shared by the accordion and the FAQPage schema so the two always match.
 * The rates and caps are LTA's, as in `parf-rates` and the LTA announcement the
 * page links to; every answer reports LTA's rules, none of it is ours.
 */
export const PARF_FAQS: Faq[] = [
  {
    question: "What is the PARF rebate?",
    answer:
      "The Preferential Additional Registration Fee (PARF) rebate is money you get back when you deregister a car before its COE expires. It returns part of the Additional Registration Fee (ARF) paid when the car was first registered, and falls as the car ages.",
  },
  {
    question: "How is the PARF rebate calculated?",
    answer:
      "It is a percentage of the ARF paid, set by the car's age at deregistration. For COEs from the 2nd bidding exercise of February 2026 onwards, LTA's rates run from 30% of ARF at 5 years or younger down to 5% at more than 9 to 10 years, capped at $30,000. Over 10 years, there is no rebate.",
  },
  {
    question: "What changed with PARF in Budget 2026?",
    answer:
      "Budget 2026 cut every PARF rate by 45 percentage points, so a car 5 years or younger now gets 30% of ARF rather than 75%, and halved the cap from $60,000 to $30,000. LTA applies the new schedule to cars with COEs from the 2nd bidding exercise of February 2026 onwards.",
  },
  {
    question: "Does the old PARF schedule still apply to my car?",
    answer:
      "Yes, if its COE was obtained up to the 1st bidding exercise of February 2026: the rates of 75% down to 50% of ARF still apply. The $60,000 cap covers COEs from the 2nd February 2023 exercise to the 1st February 2026 exercise; COEs obtained before that have no cap.",
  },
  {
    question: "Who qualifies for a PARF rebate?",
    answer:
      "A car qualifies if it was registered brand new, or as a used import no more than 3 years old after 1 September 2007. It must be no more than 10 years old when deregistered, never laid up, and its COE never renewed. Renewing the COE loses the PARF rebate for good.",
  },
  {
    question: "What is my car's deregistration value?",
    answer:
      "It is the PARF rebate plus the COE rebate. The COE rebate is the COE premium paid, pro-rated by the months left on the 10-year COE. The calculator above works out both; LTA's exact figure is on OneMotoring's Enquire PARF/COE Rebate e-service.",
  },
];
