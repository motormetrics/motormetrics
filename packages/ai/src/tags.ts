export const MONTHLY_UPDATE_TAGS = [
  "Monthly Update",
  "Cars",
  "COE",
  "PQP",
  "Deregistrations",
  "Electric Vehicles",
  "Registrations",
  "Market Trends",
] as const;

export const CARS_TAGS = [
  "Cars",
  "Electric Vehicles",
  "Registrations",
  "Fuel Types",
  "Vehicle Types",
  "Monthly Update",
  "New Registration",
  "Market Trends",
] as const;

export const COE_TAGS = [
  "COE",
  "Quota Premium",
  "1st Bidding Round",
  "2nd Bidding Round",
  "Monthly Update",
  "PQP",
] as const;

export const DEREGISTRATION_TAGS = [
  "Deregistrations",
  "Monthly Update",
  "Market Trends",
] as const;

export const EV_TAGS = [
  "Electric Vehicles",
  "Monthly Update",
  "Market Trends",
] as const;

export const PQP_TAGS = [
  "PQP",
  "COE",
  "COE Renewal",
  "Quota Premium",
  "Monthly Update",
] as const;

export type MonthlyUpdateTag = (typeof MONTHLY_UPDATE_TAGS)[number];
export type CarsTag = (typeof CARS_TAGS)[number];
export type CoeTag = (typeof COE_TAGS)[number];
export type DeregistrationTag = (typeof DEREGISTRATION_TAGS)[number];
export type EvTag = (typeof EV_TAGS)[number];
export type PqpTag = (typeof PQP_TAGS)[number];
