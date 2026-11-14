import { Skeleton, Typography } from "@heroui/react";
import { CategoryTable } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/category-table";
import { DeregistrationsChart } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-chart";
import {
  ReportMonth,
  ReportMonthShort,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-head";
import { MonthTable } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/month-table";
import {
  CATEGORIES,
  type ReportProps,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/report-data";
import { stackedPoints } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/stacked-points";
import {
  categoryCaption,
  monthsCaption,
  trendCaption,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/summary";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  Hairline,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { type ReactNode, Suspense } from "react";

const LABELS = CATEGORIES.map(({ label }) => label);

async function TrendCaption({ report }: ReportProps) {
  const { month, monthlyRows } = await report;

  return trendCaption(monthlyRows, month, LABELS);
}

async function TrendChart({ report }: ReportProps) {
  const { month, monthlyRows } = await report;

  return (
    <DeregistrationsChart
      data={stackedPoints(monthlyRows, month)}
      series={CATEGORIES.map(({ color, label }) => ({ color, label }))}
      ticks={axisTicks(
        monthlyRows.map(({ total }) => total),
        { zero: true },
      )}
    />
  );
}

async function CategoryCaption({ report }: ReportProps) {
  const { categories, month, total } = await report;

  return categoryCaption(categories, total, month);
}

async function Categories({ report }: ReportProps) {
  const { categories, yearAgoMonth } = await report;

  return (
    <CategoryTable rows={categories} yearAgoLabel={yearAgoMonth.slice(0, 4)} />
  );
}

async function MonthsCaption({ report }: ReportProps) {
  const { monthlyRows } = await report;

  return monthsCaption(monthlyRows, LABELS[0]);
}

async function Months({ report }: ReportProps) {
  const { month, monthlyRows } = await report;

  return <MonthTable rows={[...monthlyRows].reverse()} selectedMonth={month} />;
}

/** A caption that waits on the month, holding its line with a blank. */
function Caption({ children }: { children: ReactNode }) {
  return <Suspense fallback=" ">{children}</Suspense>;
}

/**
 * The page's figures under the head, ruled apart by hairlines. Headings,
 * eyebrows and source notes are in the static shell; captions, charts and
 * tables wait on the selected month behind their own boundaries.
 */
export function DeregistrationsReport({ report }: ReportProps) {
  return (
    <>
      <section className="flex scroll-mt-4 flex-col gap-4" id="dr-trend">
        <SectionHead
          caption={
            <Caption>
              <TrendCaption report={report} />
            </Caption>
          }
          eyebrow="Figure 1 · Trend"
          title="Deregistrations by month, stacked by category"
        />
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <TrendChart report={report} />
        </Suspense>
        <SourceNote>
          Source: LTA via DataMall · {SERIES_MONTHS} months to the selected
          month, zero-based. All vehicle types, counted against the COE category
          each vehicle held. The selected month is highlighted; hover or tap a
          month for counts.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex scroll-mt-4 flex-col gap-4" id="dr-categories">
        <SectionHead
          caption={
            <Caption>
              <CategoryCaption report={report} />
            </Caption>
          }
          eyebrow={
            <>
              Figure 2 ·{" "}
              <Caption>
                <ReportMonth report={report} />
              </Caption>
            </>
          }
          title="By category"
        />
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <Categories report={report} />
        </Suspense>
        <SourceNote>
          Source: LTA via DataMall · Share is of the month&apos;s total. Change
          is against the same month a year earlier; colour does not show
          direction.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex scroll-mt-4 flex-col gap-4" id="dr-months">
        <SectionHead
          caption={
            <Caption>
              <MonthsCaption report={report} />
            </Caption>
          }
          eyebrow="Figure 3 · Month by month"
          title={
            <>
              Deregistrations by category, {SERIES_MONTHS} months to{" "}
              <Caption>
                <ReportMonthShort report={report} />
              </Caption>
            </>
          }
        />
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <Months report={report} />
        </Suspense>
        <SourceNote>
          Source: LTA via DataMall · Newest first. Exempt is vehicles exempted
          from the Vehicle Quota System. Narrower screens show fewer category
          columns; the total always includes every category.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex scroll-mt-4 flex-col gap-4" id="dr-about">
        <SectionHead
          eyebrow="About the data"
          title="What a deregistration is"
        />
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <Typography.Paragraph className="max-w-prose">
            A vehicle is deregistered when it is scrapped or exported, which is
            what releases its COE back into the quota. Deregistrations in one
            month therefore set much of the supply bid for in later exercises.
          </Typography.Paragraph>
          <div className="flex flex-col gap-3">
            <Typography.Paragraph className="max-w-prose">
              The categories are the COE ones the vehicle held, so a
              deregistration is counted against the quota it returns to rather
              than the body type of the car.
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-5">
              <SectionLink className="ml-0" href="/coe/results">
                COE bidding results
              </SectionLink>
              <SectionLink className="ml-0" href="/cars/registrations">
                New registrations
              </SectionLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
