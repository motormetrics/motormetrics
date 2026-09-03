import { Button, Typography } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/**
 * The comp opens the `(site)` pages on an eyebrow pill and an oversized
 * title — larger than the dashboard `PageHead`, which is why this is
 * written here rather than reusing it. There is also no share pill: these are
 * prose pages, not a figure anyone would send on.
 */
export function HeroSection() {
  return (
    <section className="flex flex-col gap-6">
      <span className="self-start rounded-full bg-accent-soft px-4 py-2 font-bold text-accent-strong text-sm">
        Singapore car market data
      </span>
      <Typography.Heading
        level={1}
        className="max-w-4xl text-5xl leading-none lg:text-7xl"
      >
        Making sense of Singapore&apos;s car market
      </Typography.Heading>
      <Typography.Paragraph
        color="muted"
        className="max-w-3xl text-2xl leading-normal"
      >
        Vehicle registration data and COE bidding results, presented in a way
        that is easier to understand. No spreadsheets required.
      </Typography.Paragraph>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link className="no-underline" href="/">
          <Button className="rounded-full" size="lg" variant="primary">
            Explore the data
            <ArrowUpRight className="size-4" />
          </Button>
        </Link>
        <Link className="no-underline" href="/learn">
          <Button className="rounded-full" size="lg" variant="secondary">
            Read the guides
          </Button>
        </Link>
      </div>
    </section>
  );
}
