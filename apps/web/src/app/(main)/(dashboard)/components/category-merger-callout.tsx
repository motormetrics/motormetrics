import { Card, Typography } from "@heroui/react";
import { SectionLink } from "@web/components/shared/overview";
import { ReportEyebrow } from "@web/components/shared/report";

/**
 * Points readers at the explainer for LTA's October 2026 proposal to merge COE
 * Categories A and B. Temporary: retire it, or retitle it for LTA's decision,
 * once the review concludes.
 *
 * The copy names LTA as the source throughout, so the proposal never reads as
 * ours. The headline is a paragraph rather than `Card.Title`, which renders an
 * `h3` ahead of the page's own `h1`.
 */
export function CategoryMergerCallout() {
  return (
    <Card
      className="flex flex-col gap-4 sm:flex-row sm:items-center"
      variant="secondary"
    >
      <div className="flex flex-col gap-1.5">
        <ReportEyebrow>LTA public consultation · Closes 2 Nov</ReportEyebrow>
        <Typography.Paragraph weight="semibold">
          LTA proposes merging COE Categories A and B
        </Typography.Paragraph>
        <Typography.Paragraph color="muted" size="sm">
          Cars would get a rebate or surcharge of up to $15,000, depending on
          their value.
        </Typography.Paragraph>
      </div>
      <SectionLink className="ml-0 sm:ml-auto" href="/coe/category-merger">
        Read the proposal explained
      </SectionLink>
    </Card>
  );
}
