import { cn, Typography } from "@heroui/react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The body of a data page: the sections on the left and, on a wide column,
 * a sticky right sidebar for the page's filters and key figures. Before then
 * the sidebar falls under the sections, and the filters open from the
 * "Filters" button in the page head instead.
 */
export function PageBody({
  children,
  rail,
}: {
  children: ReactNode;
  rail?: ReactNode;
}) {
  if (!rail) {
    return <div className="flex min-w-0 flex-col gap-10">{children}</div>;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-4">
      <div className="flex min-w-0 flex-col gap-10 xl:col-span-3">
        {children}
      </div>
      <aside
        aria-label="Filters and key figures"
        className="flex min-w-0 flex-col gap-8 xl:sticky xl:top-6"
      >
        {rail}
      </aside>
    </div>
  );
}

/**
 * The one control in the page head that sets what the whole page reports on:
 * the month, or the period. Narrowing filters go in the right sidebar.
 */
export function ScopeControl({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 max-md:w-full", className)}>
      <Typography.Paragraph color="muted" size="xs" weight="semibold">
        {label}
      </Typography.Paragraph>
      {children}
    </div>
  );
}

/**
 * The row every data page ends on: its neighbouring pages and the guide that
 * explains it, as plain links.
 */
export function RelatedLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  return (
    <nav
      aria-label="Related pages"
      className="flex flex-wrap items-center gap-x-6 gap-y-2 border-separator border-t pt-6"
    >
      <Typography.Paragraph color="muted" size="sm" weight="semibold">
        Related
      </Typography.Paragraph>
      {links.map(({ href, label }) => (
        <Link
          className="font-semibold text-accent text-sm no-underline hover:underline"
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
