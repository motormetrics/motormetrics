/** Kept short: the layout appends " - MotorMetrics" and titles stay ≤60. */
export const compareTitle = (nameA: string, nameB: string) =>
  `${nameA} vs ${nameB} Cars in Singapore`;

/** The longer form for social cards, which have no length penalty. */
export const compareSocialTitle = (nameA: string, nameB: string) =>
  `${nameA} vs ${nameB} in Singapore: Car Registrations Compared`;

export const compareDescription = (nameA: string, nameB: string) =>
  `${nameA} vs ${nameB} new car registrations in Singapore: year-to-date totals, change on last year, market share, electric share, fuel and body type mix, and 24 months of monthly figures from LTA data.`;

export const comparePath = (slug: string) => `/cars/makes/compare/${slug}`;
