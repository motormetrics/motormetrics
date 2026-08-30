import { Typography } from "@heroui/react";
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
        <Typography.Heading level={1}>{title}</Typography.Heading>
        <Typography.Paragraph color="muted" className="max-w-prose">
          {description}
        </Typography.Paragraph>
        {actions ? (
          <div className="flex flex-wrap gap-3 pt-1">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
