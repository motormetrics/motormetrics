import type { SelectPost } from "@motormetrics/database/schema";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PostNavigationProps {
  previous?: SelectPost;
  next?: SelectPost;
}

/**
 * Previous and next monthly report, closing the article column. Not in the
 * comp, but the monthly posts are a series and readers page through them.
 */
export function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Post navigation"
      className="grid grid-cols-1 gap-6 border-border border-t-2 pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          className="group flex flex-col gap-2 text-foreground no-underline"
          href={`/blog/${previous.slug}`}
        >
          <span className="flex items-center gap-2 font-semibold text-muted text-sm transition-colors group-hover:text-accent-strong">
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform group-hover:-translate-x-0.5"
            />
            Previous
          </span>
          <span className="line-clamp-2 font-bold text-base leading-snug transition-colors group-hover:text-accent-strong">
            {previous.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          className="group flex flex-col gap-2 text-foreground no-underline sm:items-end sm:text-right"
          href={`/blog/${next.slug}`}
        >
          <span className="flex items-center gap-2 font-semibold text-muted text-sm transition-colors group-hover:text-accent-strong">
            Next
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </span>
          <span className="line-clamp-2 font-bold text-base leading-snug transition-colors group-hover:text-accent-strong">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
