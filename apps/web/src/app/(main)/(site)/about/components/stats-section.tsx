import Typography from "@web/components/typography";

/**
 * Four bare figures under hairline rules — the comp gives them no card and no
 * count-up, so the number carries the whole block on its own.
 */
const stats = [
  { label: "Years of COE and registration history", value: "10+" },
  { label: "Car makes tracked every month", value: "50+" },
  { label: "COE bidding exercises analysed", value: "120+" },
  { label: "Monthly data points across every dataset", value: "10,000+" },
];

export function StatsSection() {
  return (
    <section className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {stats.map(({ label, value }) => (
        <div
          className="flex flex-col gap-1.5 border-border border-t-2 pt-7"
          key={label}
        >
          <span className="font-extrabold text-4xl text-foreground tabular-nums leading-none tracking-tight lg:text-5xl">
            {value}
          </span>
          <Typography.TextSm>{label}</Typography.TextSm>
        </div>
      ))}
    </section>
  );
}
