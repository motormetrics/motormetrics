export interface Faq {
  answer: string;
  question: string;
}

/**
 * Shared between the accordion and the page's `FAQPage` structured data, so
 * the answers Google indexes are the ones actually on the page.
 */
export const FAQS: Faq[] = [
  {
    answer:
      "Registration figures are refreshed within days of each LTA release. COE results are published after every bidding exercise, twice a month.",
    question: "How often is the data updated?",
  },
  {
    answer:
      "All figures are sourced from Singapore's Land Transport Authority via DataMall. Nothing is estimated or modelled.",
    question: "Where does the data come from?",
  },
  {
    answer:
      "Yes. The platform is free and open, with no account required to explore the data.",
    question: "Is MotorMetrics free to use?",
  },
  {
    answer:
      "Yes, with attribution to MotorMetrics and LTA DataMall. The underlying data remains subject to LTA's own terms of use.",
    question: "Can I use the charts in my own work?",
  },
  {
    answer:
      "LTA occasionally revises past releases. When that happens we replace our copy rather than keep the old number, so the site always reflects the current official figure.",
    question: "Why do some historical figures change?",
  },
];
