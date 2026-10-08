export interface Faq {
  answer: string;
  question: string;
}

/**
 * The questions people are searching since LTA published the paper, worded the
 * way they search them. Shared by the accordion and the FAQPage schema so the
 * two always match. Every answer reports LTA's proposal; none of it is ours.
 */
export const CATEGORY_MERGER_FAQS: Faq[] = [
  {
    question: "Are COE Category A and B merging?",
    answer:
      "Not yet. On 8 October 2026, LTA proposed merging Categories A and B into a single category for cars and opened a public consultation. No decision has been made. LTA expects to complete its review by the end of 2026, after feedback closes on 2 November 2026.",
  },
  {
    question: "What is the new COE system LTA is proposing?",
    answer:
      "All car buyers would bid for COEs from one pool and pay the same clearing price. A fee-and-rebate system, or feebate, would then adjust that price by the value of the car: a rebate for lower-value cars, no change for mid-range cars and a surcharge for higher-value cars.",
  },
  {
    question: "What is the COE feebate?",
    answer:
      "It is a rebate or surcharge applied to the COE price, based on the car model's median Open Market Value (OMV). LTA proposes either three bands ($15,000 rebate, no adjustment, $15,000 surcharge) or five bands, which add $7,500 steps in between.",
  },
  {
    question: "How would the feebate use car value (OMV)?",
    answer:
      "LTA would work out the median OMV of each car model from past registrations, then band models by where that median falls among all registrations. LTA would review and publish the bands every year, and retailers could appeal a model's band.",
  },
  {
    question: "How would luxury and mass-market cars stay separate?",
    answer:
      "Through the feebate rather than separate bidding categories. Because everyone pays the same COE price, the rebate and surcharge keep a gap of up to $30,000 between the lowest-value and highest-value cars, which LTA says keeps the system progressive.",
  },
  {
    question: "Which feebate band would my car be in?",
    answer:
      "LTA has published indicative examples based on 2025 registrations. Under three bands, the Toyota Sienta and Honda Freed would get a $15,000 rebate, the Audi A3 and Toyota Corolla Altis no adjustment, and the Mercedes-Benz A180 and BMW 216 a $15,000 surcharge. Bands would be published every year if the feebate goes ahead.",
  },
  {
    question: "Will COE prices drop after the merger?",
    answer:
      "LTA says the proposal is not meant to change overall COE prices, which would still be set by demand and the available quota. It does say a larger combined pool could help reduce price volatility. What a buyer pays would also depend on their car's feebate band.",
  },
  {
    question: "Would the feebate apply to COE renewal?",
    answer:
      "Possibly not. A merged category would have one Prevailing Quota Premium (PQP) for renewals. Because Category A and B prices have converged, LTA says the feebate may not need to apply to renewals, and it could consider transitional arrangements for existing owners.",
  },
  {
    question: "What would happen to Category E?",
    answer:
      "LTA is asking for views on two options: remove Category E entirely, or keep it for cars only. Keeping it would still let urgent buyers register a car without waiting for the next exercise, while protecting the supply of Category C COEs for goods vehicles.",
  },
  {
    question: "How do I give feedback on the COE proposal?",
    answer:
      "Submit written comments to LTA at go.gov.sg/coe-pcd-feedback by 11.59pm on 2 November 2026. LTA is asking whether the categories should merge, how the feebate should be designed, whether it should apply to renewals and what should happen to Category E.",
  },
];
