import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about new car registrations, worded the way they
 * search them. Shared by the accordion and the FAQPage schema so the two always
 * match. Answers point to the figures on the page rather than quote them.
 */
export const REGISTRATIONS_FAQS: Faq[] = [
  {
    question: "How many new cars were registered in Singapore this month?",
    answer:
      "The headline figure on this page gives the number of new car registrations for the selected month, broken down by make, fuel type and vehicle type. Use the month picker to see an earlier month.",
  },
  {
    question: "How are new car registrations counted?",
    answer:
      "A car counts in the month it is registered, under the fuel type and vehicle type LTA records against it. The figures are new registrations, not the fleet already on the road.",
  },
  {
    question: "Why do some months show higher car registrations?",
    answer:
      "Car registration patterns vary with COE price movements, new model launches, promotional periods by dealers, economic conditions and seasonal buying. Lower COE prices or attractive financing options typically lead to higher registrations.",
  },
  {
    question: "Can I compare car registrations between two months?",
    answer:
      "Yes. The Compare months section on this page lets you pick two months and see how registrations moved between them.",
  },
  {
    question: "Where does this registration data come from?",
    answer:
      "From Singapore's Land Transport Authority (LTA), through LTA DataMall. It is updated monthly, following LTA's official data releases.",
  },
];
