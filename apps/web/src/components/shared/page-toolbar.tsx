import { Typography } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * The title row every dashboard page opens with: the H1 and a muted line
 * saying how current the data is on the left, the page's controls (month,
 * category, Share) on the right.
 */
export function PageToolbar({
  actions,
  asOf,
  title,
}: {
  /** Scope controls and Share, in that order. */
  actions?: ReactNode;
  /** "LTA data to October 2026"; may stream. */
  asOf?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <Typography.Heading className="text-balance" level={1}>
          {title}
        </Typography.Heading>
        {asOf ? (
          <Typography.Paragraph color="muted" size="sm">
            {asOf}
          </Typography.Paragraph>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
