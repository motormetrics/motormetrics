import type { SelectPost } from "@motormetrics/database/schema";
import type { PostCategoryKey } from "@web/app/(main)/(site)/blog/components/post/utils";
import type { Route } from "next";
import Link from "next/link";

interface FollowLink {
  href: Route;
  label: string;
}

const DEFAULT_LINKS: FollowLink[] = [
  { href: "/cars", label: "Car registrations" },
  { href: "/coe", label: "COE premiums" },
];

/**
 * The dashboard pages carrying the live figures behind each kind of post.
 * A post quotes one month; these are where the reader checks the latest.
 */
const LINKS_BY_CATEGORY: Record<PostCategoryKey, FollowLink[]> = {
  cars: [
    { href: "/cars/registrations", label: "Car registrations" },
    { href: "/cars/makes", label: "Makes" },
    { href: "/cars/fuel-types", label: "Fuel types" },
  ],
  coe: [
    { href: "/coe/premiums", label: "COE premiums" },
    { href: "/coe/results", label: "Bidding results" },
    { href: "/coe/pqp", label: "PQP rates" },
  ],
  deregistrations: [
    { href: "/cars/deregistrations", label: "Deregistrations" },
    { href: "/coe/pqp", label: "PQP rates" },
    { href: "/cars/parf", label: "PARF rebate calculator" },
  ],
  "electric-vehicles": [
    { href: "/cars/electric-vehicles", label: "Electric vehicles" },
    { href: "/cars/fuel-types", label: "Fuel types" },
    { href: "/cars/makes", label: "Makes" },
  ],
  "monthly-update": [
    { href: "/cars/registrations", label: "Car registrations" },
    { href: "/coe/premiums", label: "COE premiums" },
    { href: "/cars/electric-vehicles", label: "Electric vehicles" },
  ],
  policy: [
    { href: "/cars/parf", label: "PARF rebate calculator" },
    { href: "/coe/premiums", label: "COE premiums" },
    { href: "/cars/deregistrations", label: "Deregistrations" },
  ],
  pqp: [
    { href: "/coe/pqp", label: "PQP rates" },
    { href: "/coe/premiums", label: "COE premiums" },
    { href: "/cars/deregistrations", label: "Deregistrations" },
  ],
};

/** The rail's closing list: "Follow the figures". */
export function FollowLinks({ post }: { post: SelectPost }) {
  const links =
    LINKS_BY_CATEGORY[post.dataType as PostCategoryKey] ?? DEFAULT_LINKS;

  return (
    <div className="flex flex-col">
      <span className="border-border border-b pb-2 font-semibold text-muted text-xs">
        Follow the figures
      </span>
      {links.map(({ href, label }) => (
        <Link
          className="border-separator border-b py-2.5 font-semibold text-accent-strong text-sm no-underline transition-colors hover:text-accent-deep"
          href={href}
          key={href}
        >
          {label} →
        </Link>
      ))}
    </div>
  );
}
