import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about car fuel types in Singapore, worded the way
 * they search them. Shared by the accordion and the FAQPage schema so the two
 * always match. Answers point to the figures on the page rather than quote them.
 */
export const FUEL_TYPES_FAQS: Faq[] = [
  {
    question: "What share of new cars in Singapore are electric?",
    answer:
      "The All fuel types table gives each fuel type's share of new car registrations for the selected period, Electric included, with the change against the same period a year earlier. The trend chart shows how the shares moved over the last 12 months.",
  },
  {
    question: "How does LTA classify car fuel types?",
    answer:
      "LTA records the fuel type at registration, and reports plug-in hybrids separately from the hybrids that only charge themselves. Only battery-electric cars count as Electric. This page keeps LTA's own fuel types unmerged.",
  },
  {
    question: "What is the difference between a hybrid and a plug-in hybrid?",
    answer:
      "A hybrid (HEV) combines an internal combustion engine with an electric motor but cannot be plugged in to charge. A plug-in hybrid (PHEV) has both, with a battery that can be charged externally. LTA counts them separately, as Petrol-Electric and Petrol-Electric (Plug-In).",
  },
  {
    question: "Do these figures include cars already on the road?",
    answer:
      "No. Figures here are new registrations, not the fleet on the road, whose mix shifts far more slowly. For every car on the road, see the vehicle population page.",
  },
  {
    question: "Where does the fuel type data come from?",
    answer:
      "From Singapore's Land Transport Authority (LTA), through LTA DataMall. It is updated monthly, following LTA's official data releases.",
  },
];
