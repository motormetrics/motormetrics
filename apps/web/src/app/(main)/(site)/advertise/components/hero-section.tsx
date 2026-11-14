import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { SharePill } from "@web/components/shared/share-pill";
import { SITE_TITLE } from "@web/config";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const TITLE = "Reach people at the moment they are pricing a car";

/**
 * Direction D's head: eyebrow, title, lead and source, with the two calls to
 * action beneath. On phones the buttons split the row between them.
 */
export function HeroSection() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Typography.Paragraph
          className="uppercase"
          color="muted"
          size="xs"
          weight="semibold"
        >
          Advertise with us
        </Typography.Paragraph>
        <Typography.Heading level={1}>{TITLE}</Typography.Heading>
      </div>
      <Typography.Paragraph className="max-w-prose">
        {SITE_TITLE} readers arrive with a specific question: what a COE closed
        at, what a renewal costs, which makes are moving. Placements sit beside
        that answer, not on top of it.
      </Typography.Paragraph>
      <Typography.Paragraph color="muted" size="sm">
        Audience figures from site analytics · last 30 days
      </Typography.Paragraph>
      <div className="flex flex-wrap gap-2">
        <Link
          className={buttonVariants({
            className: "max-md:flex-1",
            variant: "primary",
          })}
          href="#contact"
        >
          Enquire about a placement
          <ArrowRight aria-hidden className="size-4" />
        </Link>
        <Link
          className={buttonVariants({
            className: "max-md:flex-1",
            variant: "outline",
          })}
          href="#placements"
        >
          See the placements
        </Link>
        <SharePill title={TITLE} />
      </div>
    </div>
  );
}
