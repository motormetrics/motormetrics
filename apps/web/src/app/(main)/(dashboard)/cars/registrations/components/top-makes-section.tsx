import { TopMakes } from "@web/app/(main)/(dashboard)/cars/registrations/components/top-makes";
import { BonesFallback } from "@web/components/shared/bones-fallback";
import { BonesCapture } from "@web/components/shared/bones-skeleton";
import { getTopMakesByFuelType } from "@web/queries/cars/market-insights";
import { Suspense } from "react";

interface TopMakesFuelSectionProps {
  month: string;
}

async function TopMakesFuelContent({ month }: TopMakesFuelSectionProps) {
  const topMakes = await getTopMakesByFuelType(month);

  return (
    <BonesCapture name="top-makes-fuel">
      <TopMakes data={topMakes} />
    </BonesCapture>
  );
}

export function TopMakesFuelSection({ month }: TopMakesFuelSectionProps) {
  return (
    <Suspense fallback={<BonesFallback name="top-makes-fuel" />}>
      <TopMakesFuelContent month={month} />
    </Suspense>
  );
}
