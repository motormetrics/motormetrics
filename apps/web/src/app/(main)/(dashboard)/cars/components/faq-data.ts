import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about Singapore car registrations, worded the way
 * they search them. Shared by the accordion and the FAQPage schema so the two
 * always match. Answers point to the figures on the page rather than quote them.
 */
export const CARS_FAQS: Faq[] = [
  {
    question: "How many new cars are registered in Singapore each month?",
    answer:
      "The headline at the top of this page gives the number of new car registrations for the selected month, and the trend chart beneath it shows the months before. A car counts in the month it is registered.",
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
