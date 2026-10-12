import { cn, Typography } from "@heroui/react";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  BarChart3,
  Car,
  DollarSign,
  FileMinus,
  History,
  type LucideIcon,
  Zap,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

interface Dataset {
  description: string;
  href: Route;
  icon: LucideIcon;
  title: string;
}

const datasets: Dataset[] = [
  {
    description:
      "Monthly car registrations by make, vehicle type and fuel type.",
    href: "/cars/registrations",
    icon: BarChart3,
    title: "New registrations",
  },
  {
    description:
      "Every bidding exercise across Categories A to E, with quota and bids received.",
    href: "/coe/premiums",
    icon: DollarSign,
    title: "COE premiums",
  },
  {
    description:
      "The prevailing quota premium for renewing a COE, as a 3-month moving average.",
    href: "/coe/pqp",
    icon: History,
    title: "PQP rates",
  },
  {
    description: "Vehicles taken off the road each month, by category.",
    href: "/cars/deregistrations",
    icon: FileMinus,
    title: "Deregistrations",
  },
  {
    description:
      "Every vehicle on Singapore roads, split by fuel type and year.",
    href: "/cars/annual",
    icon: Car,
    title: "Vehicle population",
  },
  {
    description:
      "Battery-electric and hybrid share of new registrations, by make and month.",
    href: "/cars/electric-vehicles",
    icon: Zap,
    title: "EV adoption",
  },
];

/**
 * Six datasets as a ruled grid: three across from lg, two at md, one on
 * phones. The vertical rules depend on the column count, so each cell's
 * position in its row sets them.
 */
export function DatasetsSection() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption="Six datasets, each with its own history and filters."
        eyebrow="Coverage"
        title="What we track"
      />
      <div className="grid grid-cols-1 border-border border-t md:grid-cols-2 lg:grid-cols-3">
        {datasets.map(({ description, href, icon: Icon, title }, index) => (
          <Link
            className={cn(
              "group flex min-w-0 gap-3.5 border-separator border-b py-3.5 no-underline md:py-4 md:pr-5",
              index % 2 === 1 && "md:max-lg:border-l md:max-lg:pl-5",
              index % 3 !== 0 && "lg:border-l lg:pl-5",
            )}
            href={href}
            key={title}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
              <Icon aria-hidden className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-semibold text-foreground transition-colors group-hover:text-accent-strong">
                {title} →
              </span>
              <Typography.Paragraph
                className="text-muted-strong leading-normal"
                size="sm"
              >
                {description}
              </Typography.Paragraph>
            </span>
          </Link>
        ))}
      </div>
      <SourceNote>Every dataset is sourced from LTA via DataMall.</SourceNote>
    </section>
  );
}
