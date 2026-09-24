import { periods } from "@web/types/coe";

export const getCoeMonthlyRevalidationTags = (month: string): string[] => {
  const year = month.split("-")[0];

  return [
    "coe:latest",
    "coe:previous",
    "coe:months",
    "coe:results",
    "coe:trends",
    "coe:pqp",
    ...periods.map((period) => `coe:period:${period}`),
    `coe:month:${month}`,
    `coe:year:${year}`,
  ];
};
