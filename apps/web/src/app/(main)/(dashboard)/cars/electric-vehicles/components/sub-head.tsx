import { Typography } from "@heroui/react";
import { SectionLink } from "@web/components/shared/overview";
import type { ReactNode } from "react";

/**
 * The heading of one half of a two-up figure: an H3 with a muted line under
 * it and an optional link out, as Direction D draws them.
 */
export function SubHead({
  link,
  sub,
  title,
}: {
  link?: { href: string; label: string };
  sub: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Typography.Heading className="text-lg" level={3} weight="bold">
        {title}
      </Typography.Heading>
      <Typography.Paragraph
        className="flex flex-wrap items-baseline gap-x-2"
        color="muted"
        size="sm"
      >
        <span>{sub}</span>
        {link ? (
          <SectionLink className="ml-0" href={link.href}>
            {link.label}
          </SectionLink>
        ) : null}
      </Typography.Paragraph>
    </div>
  );
}
