import { Button } from "@heroui/react";
import { Breadcrumbs } from "@web/components/shared/breadcrumbs";
import Typography from "@web/components/typography";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="flex flex-col gap-6">
      <Breadcrumbs />
      <span className="self-start rounded-full bg-accent-soft px-4 py-2 font-bold text-accent-strong text-sm">
        Advertise with us
      </span>
      <Typography.H1 className="max-w-4xl text-5xl leading-none lg:text-6xl">
        Reach people at the moment they are pricing a car
      </Typography.H1>
      <Typography.TextLg className="max-w-prose text-xl leading-normal">
        Readers arrive with a specific question: what a COE closed at, what a
        renewal costs, which makes are moving. Placements sit beside that
        answer, not on top of it.
      </Typography.TextLg>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link className="no-underline" href="#contact">
          <Button className="rounded-full" size="lg" variant="primary">
            Enquire about a placement
            <ArrowUpRight className="size-4" />
          </Button>
        </Link>
        <Link className="no-underline" href="#placements">
          <Button className="rounded-full" size="lg" variant="secondary">
            See the placements
          </Button>
        </Link>
      </div>
    </section>
  );
}
