import type { Faq } from "@web/components/shared/page-faq";

/**
 * Questions people search about electric cars in Singapore, worded the way
 * they search them. Shared by the accordion and the FAQPage schema so the two
 * always match. Answers point to the figures on the page rather than quote them.
 */
export const ELECTRIC_VEHICLES_FAQS: Faq[] = [
  {
    question: "How many electric cars are there in Singapore?",
    answer:
      "The EV share headline at the top of this page gives the number of battery-electric cars registered in the selected month and their share of new car registrations, with the change on the month before. It also gives the number of EVs already on the road.",
  },
  {
    question: "What is the difference between a BEV, a PHEV and a hybrid?",
    answer:
      "A battery electric vehicle (BEV) runs entirely on an electric motor and battery. A plug-in hybrid (PHEV) has an electric motor and a combustion engine, with a battery that can be charged externally. A hybrid (HEV) has both but cannot be plugged in.",
  },
  {
    question: "What does electrified mean?",
    answer:
      "Electrified is battery-electric, plug-in hybrid and hybrid cars combined. The electrified total on this page gives them as a share of new car registrations in the month.",
  },
  {
    question: "Which COE category is an electric car in?",
    answer:
      "It depends on the car's power output. Electric cars with power up to 110kW fall under Category A, and those above 110kW under Category B.",
  },
  {
    question: "What incentives are there for electric cars in Singapore?",
    answer:
      "Incentives include rebates under the EV Early Adoption Incentive (EEAI) and the Vehicular Emissions Scheme (VES), which gives a rebate or surcharge based on a vehicle's emissions. The VES bands section lists the bands most EVs qualify for.",
  },
  {
    question: "How many public EV chargers are there in Singapore?",
    answer:
      "The Charging network section counts the public charging points nationwide. The EV charging page lists every public location with its price and availability, from LTA DataMall.",
  },
];
