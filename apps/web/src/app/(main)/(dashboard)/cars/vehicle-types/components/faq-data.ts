import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about car body types in Singapore, worded the way
 * they search them. Shared by the accordion and the FAQPage schema so the two
 * always match. Answers point to the figures on the page rather than quote them.
 */
export const VEHICLE_TYPES_FAQS: Faq[] = [
  {
    question: "What are the most popular car types in Singapore?",
    answer:
      "The All vehicle types table ranks every vehicle type LTA records, such as sedans, hatchbacks, SUVs, MPVs and station wagons, by new car registrations in the selected period, with each type's share.",
  },
  {
    question: "Does the vehicle type decide the COE category?",
    answer:
      "No. Vehicle type does not determine COE category; engine capacity and power output do. Category A covers cars up to 1,600cc and 130bhp, or electric cars up to 110kW. Category B covers cars above 1,600cc or 130bhp, or electric cars above 110kW.",
  },
  {
    question: "How does LTA record a car's vehicle type?",
    answer:
      "LTA records the vehicle type at registration, so every car counts once, under the class on its registration record. The types here are LTA's own values, shortened only for display.",
  },
  {
    question: "What share of SUVs and MPVs are electric?",
    answer:
      "The Electric column in the All vehicle types table gives the battery-electric share of each type, so you can compare SUVs, MPVs and every other type side by side.",
  },
  {
    question: "Where does the vehicle type data come from?",
    answer:
      "From Singapore's Land Transport Authority (LTA), through LTA DataMall. It is updated monthly, following LTA's official data releases.",
  },
];
