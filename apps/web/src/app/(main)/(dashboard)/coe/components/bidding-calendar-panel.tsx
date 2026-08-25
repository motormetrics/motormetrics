import Typography from "@web/components/typography";
import { InkPanel } from "@web/components/v2/bento";
import { getCoeResults } from "@web/queries/coe";
import { CalendarDays } from "lucide-react";
import {
  formatExercise,
  formatMonth,
  groupByExercise,
  nextExercise,
} from "./coe-exercise-utils";

/**
 * The comp puts a live "next exercise closes on …" date here. LTA does not
 * publish its bidding calendar through DataMall, so the panel is built from the
 * exercises the database already holds: the exercise after the latest one is
 * fully determined by `(month, biddingNo)`.
 *
 * That also keeps the panel off the current clock, which Cache Components
 * rejects anywhere in the prerender path — the same constraint that forced
 * `components/footer.tsx` to hard-code its copyright year.
 */
export async function BiddingCalendarPanel() {
  const latest = groupByExercise(await getCoeResults()).at(-1);

  if (!latest) {
    return null;
  }

  const upcoming = nextExercise(latest);
  const schedule = [
    { label: "Latest results", note: formatExercise(latest) },
    { label: "Next exercise", note: formatExercise(upcoming) },
    { label: "Cadence", note: "Two exercises each month" },
  ];

  return (
    <InkPanel>
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-on-dark)]/20 text-[var(--accent-on-dark)]">
          <CalendarDays className="size-[19px]" />
        </span>
        <Typography.TextSm className="font-semibold text-[var(--accent-foreground)]/85">
          Bidding calendar
        </Typography.TextSm>
      </div>

      <span className="font-extrabold text-[2.875rem] text-[var(--accent-on-dark)] leading-tight tracking-[-0.03em]">
        {formatMonth(upcoming.month)}
      </span>

      <Typography.TextSm className="font-medium text-[var(--accent-foreground)]/60">
        Premiums are published at the close of each exercise, and the PQP
        ceiling is reset from the three most recent months.
      </Typography.TextSm>

      <div className="flex flex-col gap-2.5">
        {schedule.map((entry) => (
          <div
            className="flex items-center gap-3 border-[var(--accent-foreground)]/10 border-t pt-2.5"
            key={entry.label}
          >
            <Typography.TextSm className="font-semibold text-[var(--accent-foreground)]/85">
              {entry.label}
            </Typography.TextSm>
            <Typography.Caption className="ml-auto text-right font-medium text-[var(--accent-foreground)]/60">
              {entry.note}
            </Typography.Caption>
          </div>
        ))}
      </div>
    </InkPanel>
  );
}
