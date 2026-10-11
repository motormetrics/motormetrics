import { buttonVariants } from "@heroui/styles";
import { PageHead } from "@web/components/shared/page-head";
import { SITE_TITLE } from "@web/config";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * The shared page head, with the comp's two calls to action beneath it. On
 * phones the buttons split the row between them.
 */
export function HeroSection() {
  return (
    <div className="flex flex-col gap-4">
      <PageHead
        description="Vehicle registration data and COE bidding results, presented in a way that is easier to understand. No spreadsheets required."
        eyebrow="Singapore car market data"
        sub={`About ${SITE_TITLE} · Source: LTA via DataMall`}
        title="Making sense of Singapore's car market"
      />
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
      </div>
    </div>
  );
}
