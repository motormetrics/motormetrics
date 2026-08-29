import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import { getReadingMinutes } from "@web/app/(main)/(site)/learn/lib/guides";
import Typography from "@web/components/typography";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * One guide in a grid — the comps use the same card in the index's "All guides"
 * block and at the foot of a guide under "Next in this series", so it lives
 * here rather than in either.
 *
 * The comps also carry a difficulty pill beside the topic. Nothing in the guide
 * data records one, so only the term pill is drawn.
 */
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      className="group flex h-full flex-col gap-3.5 rounded-2xl bg-surface p-7 text-foreground no-underline shadow-surface transition-shadow hover:shadow-hover"
      href={`/learn/${guide.slug}`}
    >
      <span className="self-start rounded-full bg-surface-secondary px-3.5 py-1.5 font-bold text-muted text-sm">
        {guide.term}
      </span>
      <Typography.H3 className="leading-tight">{guide.title}</Typography.H3>
      <Typography.Text className="text-muted leading-normal">
        {guide.excerpt}
      </Typography.Text>
      <div className="mt-auto flex items-center gap-2.5 pt-3.5">
        <span className="font-semibold text-muted text-sm">
          {getReadingMinutes(guide.content)} min read
        </span>
        <ChevronRight
          aria-hidden
          className="ml-auto size-[1.125rem] text-accent-strong transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
