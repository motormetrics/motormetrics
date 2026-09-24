import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="flex flex-col gap-6">
      <span className="self-start rounded-full bg-accent-soft px-4 py-2 font-bold text-accent-strong text-sm">
        Advertise with us
      </span>
      <Typography.Heading
        level={1}
        className="max-w-4xl text-5xl leading-none lg:text-6xl"
      >
        Reach people at the moment they are pricing a car
      </Typography.Heading>
      <Typography.Paragraph
        color="muted"
        className="max-w-prose text-xl leading-normal"
      >
        Readers arrive with a specific question: what a COE closed at, what a
        renewal costs, which makes are moving. Placements sit beside that
        answer, not on top of it.
      </Typography.Paragraph>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          className={buttonVariants({
            className: "rounded-full no-underline",
            size: "lg",
            variant: "primary",
          })}
          href="#contact"
        >
          Enquire about a placement
          <ArrowUpRight className="size-4" />
        </Link>
        <Link
          className={buttonVariants({
            className: "rounded-full no-underline",
            size: "lg",
            variant: "secondary",
          })}
          href="#placements"
        >
          See the placements
        </Link>
      </div>
    </section>
  );
}
