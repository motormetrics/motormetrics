import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { BarRow } from "@web/components/shared/bar-row";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { Headline, SectionHead } from "@web/components/shared/overview";
import { loadElectricOnlyMakes } from "./make-rows";

export async function ElectricOnlyMakes() {
  const summary = await loadElectricOnlyMakes();

  if (!summary || summary.makes.length === 0) {
    return null;
  }

  const leadCount = summary.makes[0].count || 1;

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption="Makes selling only battery-electric cars"
        eyebrow="Electric vehicles"
        link={{ href: "/cars/electric-vehicles", label: "All electric data" }}
        title="Electric-only makes"
      />

      <div className="flex flex-wrap items-center gap-3.5">
        <Headline size="md" value={`${summary.sharePercent.toFixed(1)}%`} />
        <Typography.Paragraph className="font-medium" color="muted">
          of registrations
        </Typography.Paragraph>
      </div>

      <div className="flex flex-col gap-3.5">
        {summary.makes.map((make, index) => (
          <BarRow
            color={`var(--chart-${Math.min(6, index + 1)})`}
            key={make.make}
            label={
              <>
                <MakeAvatar logoUrl={make.logoUrl} make={make.make} size={28} />
                <span className="truncate">{make.make}</span>
              </>
            }
            share={(make.count / leadCount) * 100}
            value={
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={make.count}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
