/**
 * LTA's October 2026 consultation on merging COE Categories A and B.
 *
 * Every figure here is taken from LTA's consultation paper, not derived from
 * our own data, so the page can cite one source for all of it. Model names
 * follow LTA's tables, with "B.M.W." and "Mercedes Benz" written the usual way.
 */

export const CONSULTATION_PAPER_URL =
  "https://file.go.gov.sg/coe-public-consult.pdf";
export const FEEDBACK_URL = "https://go.gov.sg/coe-pcd-feedback";

/** When LTA published the paper; the page's Article date. */
export const PUBLISHED_DATE = "2026-10-08";

export interface FeebateBand {
  band: number;
  /** Negative for a rebate, positive for a surcharge, in dollars. */
  adjustment: number;
  /** OMV percentile range of 2025 registrations, as LTA states it. */
  percentile: string;
  /** Share of 2025 registrations in the band, in percent: the width of `percentile`. */
  share: number;
  /** LTA's "typical models", which it calls non-exhaustive. */
  models: string[];
}

/** Option A in the paper (Table 1). */
export const THREE_BANDS: FeebateBand[] = [
  {
    band: 1,
    adjustment: -15_000,
    percentile: "0–35th",
    share: 35,
    models: [
      "BYD Atto 3",
      "BYD E6",
      "Honda Freed",
      "Honda Jazz",
      "Hyundai Kona 1.6 HEV",
      "Mazda 3",
      "MG S5",
      "Nissan Note",
      "Suzuki Swift",
      "Toyota Noah",
      "Toyota Sienta",
      "Volvo EX30 110kW",
    ],
  },
  {
    band: 2,
    adjustment: 0,
    percentile: "35–50th",
    share: 15,
    models: [
      "Audi A3",
      "BYD Sealion 7 Dynamic",
      "Honda Civic 1.5 Turbo",
      "Nissan Serena",
      "Toyota Corolla Altis",
      "Xpeng G6 RWD (STD Range)",
    ],
  },
  {
    band: 3,
    adjustment: 15_000,
    percentile: "Above 50th",
    share: 50,
    models: [
      "Audi Q3",
      "BMW 216",
      "BMW iX2",
      "BYD Sealion 7 Performance",
      "Denza D9",
      "Honda Civic Type R",
      "Honda Odyssey",
      "Mercedes-Benz A180",
      "Mercedes-Benz GLC",
      "Tesla Model 3 RWD 110",
      "Tesla Model Y RWD",
      "Toyota Alphard",
    ],
  },
];

/** Option B in the paper (Table 2). */
export const FIVE_BANDS: FeebateBand[] = [
  {
    band: 1,
    adjustment: -15_000,
    percentile: "0–10th",
    share: 10,
    models: [
      "BYD E6",
      "Honda Jazz",
      "Mazda 3",
      "MG S5",
      "Nissan Note",
      "Suzuki Swift",
    ],
  },
  {
    band: 2,
    adjustment: -7_500,
    percentile: "10–35th",
    share: 25,
    models: [
      "BYD Atto 3",
      "Honda Freed",
      "Hyundai Kona 1.6 HEV",
      "Toyota Noah",
      "Toyota Sienta",
      "Volvo EX30 110kW",
    ],
  },
  {
    band: 3,
    adjustment: 0,
    percentile: "35–50th",
    share: 15,
    models: [
      "Audi A3",
      "BYD Sealion 7 Dynamic",
      "Honda Civic 1.5 Turbo",
      "Nissan Serena",
      "Toyota Corolla Altis",
      "Xpeng G6 RWD (STD Range)",
    ],
  },
  {
    band: 4,
    adjustment: 7_500,
    percentile: "50–75th",
    share: 25,
    models: [
      "Audi Q3",
      "BMW 216",
      "BYD Sealion 7 Performance",
      "Honda Odyssey",
      "Mercedes-Benz A180",
      "Tesla Model 3 RWD 110",
    ],
  },
  {
    band: 5,
    adjustment: 15_000,
    percentile: "Above 75th",
    share: 25,
    models: [
      "BMW iX2",
      "Denza D9",
      "Honda Civic Type R",
      "Mercedes-Benz GLC",
      "Tesla Model Y RWD",
      "Toyota Alphard",
    ],
  },
];

export interface Milestone {
  date: string;
  label: string;
  detail: string;
}

export const MILESTONES: Milestone[] = [
  {
    date: "Apr–May 2026",
    label: "Focus groups",
    detail:
      "LTA engages more than 200 members of the public, academics and motor trade representatives.",
  },
  {
    date: "8 Oct 2026",
    label: "Consultation opens",
    detail: "LTA publishes the consultation paper at 5pm.",
  },
  {
    date: "2 Nov 2026",
    label: "Feedback closes",
    detail: "Written comments are accepted until 11.59pm.",
  },
  {
    date: "End 2026",
    label: "Review completes",
    detail: "LTA expects to finish its review by the end of the year.",
  },
];

/** "$15,000 rebate", "No adjustment", "$7,500 surcharge". */
export const formatAdjustment = (adjustment: number): string => {
  if (adjustment === 0) {
    return "No adjustment";
  }
  const amount = `$${Math.abs(adjustment).toLocaleString("en-SG")}`;
  return adjustment < 0 ? `${amount} rebate` : `${amount} surcharge`;
};
