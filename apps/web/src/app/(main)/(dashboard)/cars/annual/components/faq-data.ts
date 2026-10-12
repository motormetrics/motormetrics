import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about Singapore's vehicle population, worded the way
 * they search them. Shared by the accordion and the FAQPage schema so the two
 * always match. Answers point to the figures on the page rather than quote them.
 */
export const ANNUAL_FAQS: Faq[] = [
  {
    question: "How many cars are there in Singapore?",
    answer:
      "The headline on this page gives the number of cars registered in Singapore at 31 December of the latest year LTA has published, with the change on the year before and the cars' share of all vehicles.",
  },
  {
    question: "How many vehicles are on the road in Singapore?",
    answer:
      "The All vehicle classes table lists every class of vehicle registered at 31 December, such as cars and motorcycles, with the total across all of them in its caption.",
  },
  {
    question: "How many electric cars are on the road in Singapore?",
    answer:
      "The Electric fleet section counts the electric cars on the road at 31 December of each of the last few years. For new electric car registrations each month, see the electric vehicles page.",
  },
  {
    question: "How is the vehicle population different from new registrations?",
    answer:
      "The vehicle population counts every vehicle registered at the end of the year, once a year. New registrations count only the cars registered in a month, so the population mix shifts far more slowly.",
  },
  {
    question: "Where does the vehicle population data come from?",
    answer:
      "From Singapore's Land Transport Authority (LTA), through LTA DataMall. LTA counts the vehicle population once a year, at 31 December.",
  },
];
