import { Typography } from "@heroui/react";
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
 * Six datasets as linked cards on the white ground: as many 320px-plus
 * columns as the main column fits, one on phones.
 */
export function DatasetsSection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-4" id="what-we-track">
      <SectionHead
        caption="Six datasets, each with its own history and filters."
        eyebrow="Coverage"
        title="What we track"
      />
      <div className="@container">
        <div className="grid @3xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1 gap-3.5">
          {datasets.map(({ description, href, icon: Icon, title }) => (
            <Link
              className="group flex min-w-0 flex-col gap-2 rounded-lg border border-separator bg-surface px-5 py-4 text-foreground no-underline transition-colors hover:border-accent-border"
              href={href}
              key={title}
            >
              <span className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
                  <Icon aria-hidden className="size-4" />
                </span>
                <Typography.Heading
                  className="text-lg group-hover:underline"
                  level={3}
                  weight="bold"
                >
                  {title}
                </Typography.Heading>
              </span>
              <Typography.Paragraph
                className="text-muted-strong leading-normal"
                size="sm"
              >
                {description}
              </Typography.Paragraph>
              <span className="mt-auto flex flex-wrap justify-between gap-x-3 gap-y-1 border-separator border-t pt-2.5 text-muted text-xs">
                <span>LTA via DataMall</span>
                <span>Open →</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <SourceNote>Every dataset is sourced from LTA via DataMall.</SourceNote>
    </section>
  );
}
