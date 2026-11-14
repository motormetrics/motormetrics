import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { SharePill } from "@web/components/shared/share-pill";
import { SITE_TITLE } from "@web/config";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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
          About {SITE_TITLE} · Singapore car market data
        </Typography.Paragraph>
        <Typography.Heading level={1}>
          Making sense of Singapore&apos;s car market
        </Typography.Heading>
      </div>
      <Typography.Paragraph className="max-w-prose">
        Vehicle registration data and COE bidding results, presented in a way
        that is easier to understand. No spreadsheets required.
      </Typography.Paragraph>
      <Typography.Paragraph color="muted" size="sm">
        Source: LTA via DataMall.
      </Typography.Paragraph>
      <div className="flex flex-wrap gap-2">
        <Link
          className={buttonVariants({
            className: "max-md:flex-1",
            variant: "primary",
          })}
          href="/"
        >
          Explore the data
          <ArrowRight aria-hidden className="size-4" />
        </Link>
        <Link
          className={buttonVariants({
            className: "max-md:flex-1",
            variant: "outline",
          })}
          href="/learn"
        >
          Read the guides
        </Link>
        <SharePill title="Making sense of Singapore's car market" />
      </div>
    </div>
  );
}
