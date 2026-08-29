import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import { getReadingMinutes } from "@web/app/(main)/(site)/learn/lib/guides";
import { SharePill } from "@web/components/shared/share-pill";
import Typography from "@web/components/typography";
import Link from "next/link";

/**
 * The comp's guide opening: crumb, term pill, title, lede, then the reading
 * estimate, the revision date and the share control on one line.
 *
 * The trail is written out rather than taken from `shared/breadcrumbs`, which
 * derives its labels from the pathname: "/learn/coe" would title-case to "Coe"
 * where the term is an abbreviation and should read "COE".
 *
 * Capped at the comp's 860px so the title breaks over a reading measure rather
 * than the full 1180px page.
 */
export function GuideHead({ guide }: { guide: Guide }) {
  return (
    <div className="flex max-w-[53.75rem] flex-col gap-5">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          {[
            { href: "/", label: "Home" },
            { href: "/learn", label: "Learn" },
          ].map(({ href, label }) => (
            <li className="flex items-center gap-2" key={href}>
              <Link
                className="font-medium text-muted text-sm no-underline transition-colors hover:text-foreground"
                href={href}
              >
                {label}
              </Link>
              <span aria-hidden className="text-muted text-sm">
                /
              </span>
            </li>
          ))}
          <li>
            <span
              aria-current="page"
              className="font-semibold text-muted text-sm"
            >
              {guide.term}
            </span>
          </li>
        </ol>
      </nav>

      <span className="self-start rounded-full bg-accent-soft-2 px-4 py-2 font-bold text-accent-strong text-sm">
        {guide.term}
      </span>

      <Typography.H1 className="font-bold text-[2.75rem] leading-[1.06] tracking-[-0.03em] lg:text-[3.375rem]">
        {guide.title}
      </Typography.H1>

      <Typography.TextLg className="max-w-[43.75rem] font-medium text-muted leading-[1.55]">
        {guide.excerpt}
      </Typography.TextLg>

      <div className="flex flex-wrap items-center gap-3.5">
        <span className="font-semibold text-base text-muted">
          {getReadingMinutes(guide.content)} min read
        </span>
        <span aria-hidden className="size-1.5 rounded-full bg-border" />
        <span className="font-semibold text-base text-muted">
          Updated{" "}
          {new Date(guide.lastUpdated).toLocaleDateString("en-SG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <SharePill title={guide.title} />
      </div>
    </div>
  );
}
