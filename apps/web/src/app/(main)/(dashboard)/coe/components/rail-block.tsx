import { Typography } from "@heroui/react";
import { SectionLink } from "@web/components/shared/overview";
import type { ReactNode } from "react";

/**
 * One block of key figures in a COE page's right sidebar: a small heading
 * with a muted qualifier, the figures as `KeyNumberItem`s, and a link to the
 * page that carries the full data.
 */
export function RailBlock({
  children,
  link,
  sub,
  title,
}: {
  /** `KeyNumberItem`s. */
  children: ReactNode;
  link?: { href: string; label: string };
  /** "PQP, November 2026", "2026 to date". */
  sub?: ReactNode;
  title: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2 border-separator border-t pt-6">
      <Typography.Heading className="text-base" level={2}>
        {title}
        {sub ? <span className="font-normal text-muted"> {sub}</span> : null}
      </Typography.Heading>
      <dl className="grid grid-cols-2 gap-x-6 divide-separator xl:grid-cols-1 xl:divide-y">
        {children}
      </dl>
      {link ? (
        <SectionLink className="ml-0 self-start" href={link.href}>
          {link.label}
        </SectionLink>
      ) : null}
    </section>
  );
}
