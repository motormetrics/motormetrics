import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about one vehicle type, with its name in the wording
 * they search, such as "How many SUV cars are registered in Singapore?". Shared
 * by the accordion and the FAQPage schema so the two always match. Answers
 * point to the figures on the page rather than quote them, so they never go
 * stale.
 */
export const buildVehicleTypeFaqs = (vehicleType: string): Faq[] => [
  {
    question: `How many ${vehicleType} cars are registered in Singapore?`,
    answer: `The headline on this page counts new ${vehicleType} registrations for the selected period, across all makes and fuel types. It counts new registrations, not the ${vehicleType} cars already on the road.`,
  },
  {
    question: `What share of ${vehicleType} cars in Singapore are electric?`,
    answer: `The electric share beside the headline gives the share of ${vehicleType} registrations that are electric, and the By fuel type section splits ${vehicleType} registrations across every fuel type in the period.`,
  },
  {
    question: `Which car makes sell the most ${vehicleType} cars in Singapore?`,
    answer: `The ${vehicleType} by make table ranks the leading makes by ${vehicleType} registrations in the period, with each make's share and its change against the same period a year earlier.`,
  },
  {
    question: `Does a ${vehicleType} need a Category A or Category B COE?`,
    answer:
      "It depends on the car, not its body type. Vehicle type does not determine COE category; engine capacity and power output do. Category A covers cars up to 1,600cc and 130bhp, or electric cars up to 110kW. Category B covers cars above 1,600cc or 130bhp, or electric cars above 110kW.",
  },
  {
    question: `How are ${vehicleType} registrations counted?`,
    answer:
      "A car counts in the month it is registered, under the vehicle type LTA records against it. Vehicle types are LTA's own values, shortened only for display; the underlying figures are unchanged.",
  },
];
