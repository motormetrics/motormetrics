import Typography from "@web/components/typography";
import type { ReactNode } from "react";

interface SitePageHeroProps {
  actions?: ReactNode;
  description: ReactNode;
  title: ReactNode;
}

export function SitePageHero({
  actions,
  description,
  title,
}: SitePageHeroProps) {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="flex max-w-3xl flex-col items-start gap-5">
        <Typography.H1>{title}</Typography.H1>
        <Typography.TextLg className="max-w-[70ch] text-muted">
          {description}
        </Typography.TextLg>
        {actions ? (
          <div className="flex flex-wrap gap-3 pt-1">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
