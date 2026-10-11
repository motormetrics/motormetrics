import { NumberValue } from "@heroui-pro/react";
import { ElectricOnlyRows } from "@web/app/(main)/(dashboard)/cars/makes/components/electric-only-rows";
import {
  loadElectricOnlyMakes,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead } from "@web/components/shared/overview";
import { getCarsLatestMonth } from "@web/queries/cars";

export async function ElectricOnlyMakes() {
  const [summary, latestMonth] = await Promise.all([
    loadElectricOnlyMakes(),
    getCarsLatestMonth(),
  ]);

  if (!summary || summary.makes.length === 0 || !latestMonth) {
    return null;
  }

  const leadCount = summary.makes[0].count || 1;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`Makes selling only battery-electric cars · ${summary.sharePercent.toFixed(1)}% of registrations`}
        eyebrow="Electric vehicles"
        link={{ href: "/cars/electric-vehicles", label: "All electric data" }}
        title="Electric-only makes"
      />

      <ElectricOnlyRows
        header={
          <div className="flex items-center gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
            <span className="min-w-0 flex-1 md:w-36 md:flex-none">Make</span>
            <span className="min-w-0 flex-1 max-md:hidden" />
            <span className="w-16 text-right">Cars</span>
          </div>
        }
        note={`Year to date, ${periodLabel(latestMonth, "ytd")}, all fuel types. This list does not follow the period or fuel switches.`}
        rows={summary.makes.map((make, index) => (
          <div
            className="flex items-center gap-3 border-separator border-b py-2"
            key={make.make}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5 md:w-36 md:flex-none">
              <MakeAvatar logoUrl={make.logoUrl} make={make.make} size="sm" />
              <span className="truncate font-medium text-sm">{make.make}</span>
            </span>
            <span className="h-2.5 min-w-0 flex-1 rounded-r-xs bg-surface-secondary max-md:hidden">
              <span
                className="block h-full rounded-r-xs"
                style={{
                  background: index === 0 ? "var(--chart-1)" : "var(--chart-3)",
                  width: `${((make.count / leadCount) * 100).toFixed(1)}%`,
                }}
              />
            </span>
            <span className="w-16 text-right font-semibold text-sm tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={make.count}
              />
            </span>
          </div>
        ))}
      />
    </div>
  );
}
