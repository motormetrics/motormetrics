import { Card, Typography } from "@heroui/react";
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

export function DatasetsSection() {
  return (
    <section className="flex flex-col gap-7">
      <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr] lg:gap-14">
        <Typography.Heading level={2}>What we track</Typography.Heading>
        <Typography.Paragraph className="max-w-prose text-lg">
          Six datasets, each with its own history and filters.
        </Typography.Paragraph>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {datasets.map(({ description, href, icon: Icon, title }) => (
          <Link className="no-underline" href={href} key={title}>
            <Card className="h-full transition-shadow hover:shadow-hover">
              <Card.Content className="flex flex-col gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <Icon className="size-5.5" />
                </span>
                <Typography.Heading level={3} className="text-xl">
                  {title}
                </Typography.Heading>
                <Typography.Paragraph className="leading-normal">
                  {description}
                </Typography.Paragraph>
              </Card.Content>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
