"use client";

import dynamic from "next/dynamic";

const PARFCalculator = dynamic(
  () => import("./parf-calculator").then((mod) => mod.PARFCalculator),
  { ssr: false },
);
const PARFComparisonTable = dynamic(
  () =>
    import("./parf-comparison-table").then((mod) => mod.PARFComparisonTable),
  { ssr: false },
);

export function PARFSections() {
  return (
    <>
      <PARFCalculator />
      <PARFComparisonTable />
    </>
  );
}
