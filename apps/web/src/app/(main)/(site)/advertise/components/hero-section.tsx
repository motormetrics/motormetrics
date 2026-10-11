import { buttonVariants } from "@heroui/styles";
import { PageHead } from "@web/components/shared/page-head";
import { SITE_TITLE } from "@web/config";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * The shared page head, with the two calls to action beneath it. On phones
 * the buttons split the row between them.
 */
export function HeroSection() {
  return (
    <div className="flex flex-col gap-4">
      <PageHead
        description={`${SITE_TITLE} readers arrive with a specific question: what a COE closed at, what a renewal costs, which makes are moving. Placements sit beside that answer, not on top of it.`}
        eyebrow="Advertise with us"
        sub="Audience figures from site analytics · last 30 days"
        title="Reach people at the moment they are pricing a car"
      />
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
      </div>
    </div>
  );
}
