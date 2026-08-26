import { NumberValue } from "@heroui-pro/react";
import { InkPanel } from "@web/components/shared/bento";
import Typography from "@web/components/typography";
import { Zap } from "lucide-react";
import { MakeAvatar } from "./make-avatar";
import { loadElectricOnlyMakes } from "./make-rows";

export async function ElectricOnlyMakes() {
  const summary = await loadElectricOnlyMakes();

  if (!summary || summary.makes.length === 0) {
    return null;
  }

  const leadCount = summary.makes[0].count || 1;

  return (
    <InkPanel>
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-on-dark/20 text-accent-on-dark">
          <Zap className="size-4.5" />
        </span>
        <Typography.TextSm className="font-semibold text-accent-foreground/85 text-base">
          Electric-only makes
        </Typography.TextSm>
      </div>

      <span className="font-extrabold text-5xl text-accent-on-dark tabular-nums tracking-[-0.03em]">
        {summary.sharePercent.toFixed(1)}%
      </span>

      <Typography.TextSm className="font-medium text-accent-foreground/60">
        of registrations went to makes selling only battery-electric cars
      </Typography.TextSm>

      <div className="mt-2 flex flex-col gap-3">
        {summary.makes.map((make, index) => (
          <div className="flex flex-col gap-1.5" key={make.make}>
            <div className="flex items-center">
              <span className="flex min-w-0 items-center gap-2.5">
                <MakeAvatar logoUrl={make.logoUrl} make={make.make} size={22} />
                <span className="truncate font-semibold text-[14.5px] text-accent-foreground/85">
                  {make.make}
                </span>
              </span>
              <span className="ml-auto font-bold text-[14.5px] text-accent-foreground tabular-nums">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={make.count}
                />
              </span>
            </div>
            <span className="block h-2 overflow-hidden rounded-full bg-accent-foreground/10">
              <span
                className="block h-full rounded-full"
                style={{
                  backgroundColor:
                    index === 0
                      ? "var(--accent-on-dark)"
                      : "color-mix(in oklab, var(--accent-on-dark) 45%, transparent)",
                  width: `${Math.max(2, (make.count / leadCount) * 100).toFixed(1)}%`,
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </InkPanel>
  );
}
