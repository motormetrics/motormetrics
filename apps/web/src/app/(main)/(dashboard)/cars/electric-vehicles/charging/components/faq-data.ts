import { type ChargingStats, formatPerKwh } from "./price-stats";

export interface Faq {
  answer: string;
  question: string;
}

const count = (value: number) => value.toLocaleString("en-SG");

/**
 * Questions people ask search engines about charging in Singapore, answered
 * with the figures on the page so the accordion and the FAQPage schema quote
 * the same live numbers. Each answer is kept to a self-contained 40–60 words.
 */
export const buildChargingFaqs = (stats: ChargingStats): Faq[] => [
  {
    question: "How much does it cost to charge an EV in Singapore?",
    answer: `Public charging in Singapore is priced per kWh. Across ${count(stats.locations)} public locations the median advertised rate is ${formatPerKwh(stats.medianPerKwh)}, with AC charging from ${formatPerKwh(stats.cheapestAc)} and DC fast charging from ${formatPerKwh(stats.cheapestDc)}. Rates vary by operator and even between neighbouring car parks, so it pays to compare before plugging in.`,
  },
  {
    question: "Where is the cheapest public EV charger in Singapore?",
    answer: `The cheapest advertised AC rate is currently ${formatPerKwh(stats.cheapestAc)} and the cheapest DC rate is ${formatPerKwh(stats.cheapestDc)}. The lists on this page rank every location by price, for all of Singapore or one postal district, using the rates operators publish to LTA DataMall.`,
  },
  {
    question: "What is the difference between AC and DC charging?",
    answer: `AC chargers, typically 7 to 22 kW, use the car's onboard charger and suit overnight or workplace parking. DC fast chargers, from 30 kW to 180 kW, bypass it and can add most of a battery in under an hour. ${count(stats.dcLocations)} of Singapore's ${count(stats.locations)} public locations offer DC charging, usually at a higher rate.`,
  },
  {
    question: "How many public EV chargers are there in Singapore?",
    answer: `LTA DataMall lists ${count(stats.connectors)} public charging connectors across ${count(stats.locations)} locations, run by ${count(stats.operators)} operators. The figure counts individual connectors rather than charging stations, so a station with two plugs contributes two.`,
  },
  {
    question: "How current is the availability shown here?",
    answer:
      "Availability comes from LTA DataMall's EV Charging Points feed, which operators update and LTA republishes every five minutes. This page refreshes on the same cadence, so a connector shown as free was free within the last few minutes. Prices are the operators' advertised rates, including GST.",
  },
];
