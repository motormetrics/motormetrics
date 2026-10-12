import type { Faq } from "@web/components/shared/page-faq";
import { SITE_TITLE } from "@web/config";

/**
 * Questions people search about the Singapore car market, worded the way they
 * search them. Shared by the accordion and the FAQPage schema so the two always
 * match. Answers point to the figures on the page rather than quote them.
 */
export const HOME_FAQS: Faq[] = [
  {
    question: `Where does ${SITE_TITLE} get its data?`,
    answer:
      "All vehicle registration and COE data comes from Singapore's Land Transport Authority (LTA), through LTA DataMall. We process and format that data into the charts and tables on this site.",
  },
  {
    question: "How often are car registrations and COE results updated?",
    answer:
      "Car registration data is updated monthly, following LTA's official data releases. COE results follow each bidding exercise: LTA holds two a month, opening at 12pm on the first and third Monday and closing at 4pm on the third day.",
  },
  {
    question: "What is COE in Singapore?",
    answer:
      "A Certificate of Entitlement (COE) is a quota licence required to own a vehicle in Singapore. It gives the holder the right to register, own and use a vehicle for 10 years. The COE system was introduced in May 1990 to control vehicle population growth.",
  },
  {
    question: "What are the COE categories?",
    answer:
      "There are five: Category A (cars up to 1,600cc and 130bhp, or electric cars up to 110kW), Category B (cars above 1,600cc or 130bhp, or electric cars above 110kW), Category C (goods vehicles and buses), Category D (motorcycles) and Category E (an open category for any vehicle type).",
  },
  {
    question: "Which car makes are the most popular in Singapore?",
    answer:
      "The top makes section on this page ranks makes by new car registrations so far this year, with each make's share. The Makes page ranks every make for the month, the year to date or the last 12 months.",
  },
];
