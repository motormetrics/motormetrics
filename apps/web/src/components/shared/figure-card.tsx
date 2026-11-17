import { Card } from "@heroui/react";
import { SectionLink } from "@web/components/shared/overview";
import type { ReactNode } from "react";

/**
 * One chart or table on a dashboard page: a card with its title, a one-line
 * description and either a link to the page holding the full data or the
 * figure's own controls.
 */
export function FigureCard({
  children,
  description,
  link,
  title,
  trailing,
}: {
  children: ReactNode;
  /** The period or scope, in one line: "Last 12 months". */
  description?: ReactNode;
  link?: { href: string; label: string };
  title: ReactNode;
  /** Controls instead of a link: range tabs, a category switch. */
  trailing?: ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <Card.Header className="flex-row flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Card.Title>{title}</Card.Title>
          {description ? (
            <Card.Description>{description}</Card.Description>
          ) : null}
        </div>
        {link ? <SectionLink href={link.href}>{link.label}</SectionLink> : null}
        {trailing ? (
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 sm:ml-auto">
            {trailing}
          </div>
        ) : null}
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">{children}</Card.Content>
    </Card>
  );
}
