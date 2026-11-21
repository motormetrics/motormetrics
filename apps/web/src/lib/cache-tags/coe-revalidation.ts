export const getCoeRevalidationMonthlyRevalidationTags = (
  month: string,
): string[] => {
  const year = month.split("-")[0];

  return [
    `coe:revalidation:month:${month}`,
    "coe:revalidation:months",
    `coe:revalidation:year:${year}`,
  ];
};
