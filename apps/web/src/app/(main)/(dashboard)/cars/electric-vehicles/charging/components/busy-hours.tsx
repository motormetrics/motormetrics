import { Typography } from "@heroui/react";
import { SurfaceCard } from "@web/components/shared/bento";
import { getEvChargingUtilisationByHour } from "@web/queries/ev-charging";

const formatHour = (hour: number) => {
  const suffix = hour < 12 ? "am" : "pm";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve} ${suffix}`;
};

/** Occupancy by hour of day over the past week, as a 24-bar strip. */
export async function BusyHours() {
  const hours = await getEvChargingUtilisationByHour();
  const peak = hours.reduce((best, item) =>
    item.utilisationPercent > best.utilisationPercent ? item : best,
  );
  const max = Math.max(peak.utilisationPercent, 1);

  if (peak.utilisationPercent === 0) {
    return null;
  }

  return (
    <SurfaceCard className="gap-4 p-7">
      <div className="flex flex-col gap-1">
        <Typography.Paragraph className="text-muted">
          Busy hours
        </Typography.Paragraph>
        <Typography.Heading level={3}>
          Busiest at {formatHour(peak.hour)} ·{" "}
          {peak.utilisationPercent.toFixed(0)}% in use
        </Typography.Heading>
      </div>

      <div
        aria-label="Share of connectors in use by hour of day"
        className="flex h-32 items-end gap-1"
        role="img"
      >
        {hours.map((item) => (
          <div
            className="flex-1 rounded-t-md"
            key={item.hour}
            style={{
              background:
                item.hour === peak.hour ? "var(--accent)" : "var(--chart-1)",
              height: `${(item.utilisationPercent / max) * 100}%`,
              opacity: item.hour === peak.hour ? 1 : 0.55,
            }}
            title={`${formatHour(item.hour)} · ${item.utilisationPercent.toFixed(0)}% in use`}
          />
        ))}
      </div>
      <div className="flex justify-between text-muted text-xs">
        <span>12 am</span>
        <span>6 am</span>
        <span>12 pm</span>
        <span>6 pm</span>
        <span>11 pm</span>
      </div>

      <Typography.Paragraph color="muted" size="xs">
        Share of connectors in use, Singapore time · past 7 days
      </Typography.Paragraph>
    </SurfaceCard>
  );
}
