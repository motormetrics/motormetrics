import {
  formatExercise,
  formatMonth,
  groupByExercise,
  nextExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { Headline, SectionHead } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";

/**
 * The comp puts a live "next exercise closes on …" date here. LTA does not
 * publish its bidding calendar through DataMall, so the section is built from
 * the exercises the database already holds: the exercise after the latest one
 * is fully determined by `(month, biddingNo)`, and the headline names its
 * month rather than a day.
 *
 * That also keeps the section off the current clock, which Cache Components
 * rejects anywhere in the prerender path — the same constraint that forced
 * `components/footer.tsx` to hard-code its copyright year.
 */
export async function BiddingCalendar() {
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
    <div className="flex flex-col gap-6">
      <SectionHead
        caption="Bidding closes at 16:00 · results published the same afternoon"
        eyebrow="Bidding calendar"
        title="Next exercise closes"
      />

      <Headline size="md" value={formatMonth(upcoming.month)} />

      <div className="flex flex-col">
        {schedule.map((entry) => (
          <div
            className="flex items-center gap-3 border-separator border-b py-3.5"
            key={entry.label}
          >
            <span className="font-semibold text-base text-foreground/85">
              {entry.label}
            </span>
            <span className="ml-auto whitespace-nowrap font-medium text-muted text-sm">
              {entry.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
