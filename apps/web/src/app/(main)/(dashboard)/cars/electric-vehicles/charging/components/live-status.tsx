import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { HeroCard } from "@web/components/shared/bento";
import { getEvChargingLiveSummary } from "@web/queries/ev-charging";

const formatObservedAt = (iso: string) =>
  new Date(iso).toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

/** Island-wide connector state at the last five-minute batch. */
export async function LiveStatus() {
  const summary = await getEvChargingLiveSummary();
  if (summary.connectors === 0 || !summary.observedAt) {
    return null;
  }

  const usable = summary.connectors - summary.unavailable;
  const inUsePercent = usable > 0 ? (summary.occupied / usable) * 100 : 0;

  return (
    <HeroCard>
      <span className="w-fit rounded-full bg-accent-foreground/20 px-4 py-2 font-bold text-sm">
        Live · {formatObservedAt(summary.observedAt)} SGT
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-extrabold text-6xl tabular-nums tracking-tight">
          {inUsePercent.toFixed(0)}%
        </span>
        <span className="rounded-full bg-accent-foreground/20 px-4 py-2 font-bold text-sm tabular-nums">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={summary.available}
          />{" "}
          free
        </span>
      </div>

      <Typography.Paragraph className="text-accent-foreground/85">
        of public connectors in use right now
      </Typography.Paragraph>

      <Typography.Paragraph size="sm" className="text-accent-foreground/70">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={summary.connectors}
        />{" "}
        connectors across{" "}
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={summary.locations}
        />{" "}
        locations
        {summary.unavailable > 0 ? (
          <>
            {" · "}
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={summary.unavailable}
            />{" "}
            out of service
          </>
        ) : null}
      </Typography.Paragraph>
    </HeroCard>
  );
}
