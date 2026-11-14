import { Typography } from "@heroui/react";
import { TableOfContents } from "@web/app/(main)/(site)/blog/components/table-of-contents";
import type { ReactNode } from "react";

export interface Highlight {
  value: string;
  label: string;
  detail?: string;
}

/**
 * The post's own key figures beside the head once the page is wide, under it
 * before then, with the jump list into the article beneath them.
 */
export function KeyHighlights({
  highlights,
  period,
}: {
  highlights?: Highlight[];
  /** "August 2026" for a monthly post. */
  period?: ReactNode;
}) {
  const hasFigures = Boolean(highlights && highlights.length > 0);

  return (
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      {hasFigures ? (
        <>
          <Typography.Paragraph
            className="uppercase"
            color="muted"
            size="xs"
            weight="semibold"
          >
            Key numbers{period ? <> · {period}</> : null}
          </Typography.Paragraph>
          <dl className="grid @3xl:grid-cols-3 grid-cols-2 gap-x-6 border-separator border-t">
            {highlights?.map((item) => (
              <div
                className="flex flex-col gap-0.5 border-separator border-b py-3"
                key={`${item.label}-${item.value}`}
              >
                <dt className="font-semibold text-muted text-xs">
                  {item.label}
                </dt>
                <dd className="font-semibold text-xl tabular-nums">
                  {item.value}
                </dd>
                {item.detail ? (
                  <dd className="text-muted text-xs tabular-nums">
                    {item.detail}
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </>
      ) : null}
      <TableOfContents />
      {hasFigures ? (
        <Typography.Paragraph color="muted" size="xs">
          Figures quoted in this post. Source: LTA via DataMall.
        </Typography.Paragraph>
      ) : null}
    </aside>
  );
}
