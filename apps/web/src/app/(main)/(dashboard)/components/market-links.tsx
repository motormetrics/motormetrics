import { Typography } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface MarketLink {
  href: string;
  label: string;
  title: string;
}

/**
 * The label names LTA without a closing date: whether the consultation is
 * still open depends on today, and the page cannot read the clock under Cache
 * Components. The merger post carries the dates.
 */
const MARKET_LINKS: MarketLink[] = [
  {
    href: "/blog/lta-coe-category-merger-proposal",
    label: "LTA consultation",
    title: "Merging Categories A and B",
  },
  { href: "/cars/parf", label: "Calculators", title: "ARF and PARF rebate" },
  { href: "/learn", label: "New to COE?", title: "Read the guides" },
];

/**
 * Ways on from the homepage's figures: LTA's Category A and B proposal, the
 * calculators and the guides, each a whole-row link ruled by hairlines.
 */
export function MarketLinks() {
  return (
    <nav aria-label="More from MotorMetrics">
      <ul className="grid border-separator border-t md:grid-cols-3 md:gap-x-6">
        {MARKET_LINKS.map((item) => (
          <li className="flex border-separator border-b" key={item.href}>
            <Link
              className="group flex w-full flex-col gap-1 py-4 text-foreground no-underline"
              href={item.href}
            >
              <Typography.Paragraph color="muted" size="sm">
                {item.label}
              </Typography.Paragraph>
              <span className="flex items-center justify-between gap-4">
                <Typography.Paragraph weight="semibold">
                  {item.title}
                </Typography.Paragraph>
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
