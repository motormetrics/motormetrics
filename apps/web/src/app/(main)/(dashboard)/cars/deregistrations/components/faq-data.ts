import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about vehicle deregistration, worded the way they
 * search them. Shared by the accordion and the FAQPage schema so the two always
 * match. Answers point to the figures on the page rather than quote them.
 */
export const DEREGISTRATIONS_FAQS: Faq[] = [
  {
    question: "What is vehicle deregistration in Singapore?",
    answer:
      "Deregistration removes a vehicle from the Singapore register, either for export or scrappage, or to claim the PARF and COE rebates. This page counts the vehicles deregistered each month, by the COE category each vehicle held.",
  },
  {
    question: "How do deregistrations affect the COE quota?",
    answer:
      "LTA sets the COE quota quarterly from deregistrations and the allowed growth in the vehicle population. Each deregistered vehicle is counted against the COE category its quota returns to, which is how this page groups them.",
  },
  {
    question: "What does Exempt mean in the deregistration figures?",
    answer:
      "Exempt is vehicles exempted from the Vehicle Quota System (VQS), the system that controls Singapore's vehicle population through COE quotas.",
  },
  {
    question: "How much do I get back when I deregister my car?",
    answer:
      "Your deregistration value is the PARF rebate plus the COE rebate. The PARF rebate returns part of the ARF paid at registration, depending on the car's age; the COE rebate returns the unused part of the COE premium. The PARF calculator works out both.",
  },
  {
    question: "Where does the deregistration data come from?",
    answer:
      "From Singapore's Land Transport Authority (LTA), through LTA DataMall, counted by month.",
  },
];
