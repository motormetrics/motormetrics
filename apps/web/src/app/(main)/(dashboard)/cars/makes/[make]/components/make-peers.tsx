import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { MakePeriodTotal } from "@web/queries/cars/makes/period-totals";
import Link from "next/link";

/** The largest makes in the period as bars against the leader, the current make always among them. */
export function MakePeers({
  logoUrlBySlug,
  make,
  peers,
  periodCaption,
}: {
  logoUrlBySlug: Record<string, string>;
  make: string;
  peers: MakePeriodTotal[];
  periodCaption: string;
}) {
  const peerLeader = peers[0]?.count ?? 0;

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${periodCaption} · all fuel types`}
        eyebrow="Peers"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Against other makes"
      />
      <div className="flex flex-col">
        {peers.map(({ count, make: peerMake }) => {
          const isCurrent = peerMake === make;
          const slug = slugify(peerMake);
          return (
            <div
              className="flex items-center gap-3 border-separator border-b py-2"
              key={peerMake}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5 md:w-36 md:flex-none">
                <MakeAvatar
                  logoUrl={logoUrlBySlug[slug] ?? null}
                  make={peerMake}
                  size="sm"
                />
                <Link
                  className={cn(
                    "truncate text-sm no-underline",
                    isCurrent
                      ? "font-semibold text-accent-strong"
                      : "font-medium text-foreground hover:text-accent-strong",
                  )}
                  href={`/cars/makes/${slug}`}
                >
                  {peerMake}
                </Link>
              </span>
              <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary max-md:hidden">
                <span
                  className="block h-full rounded-r-xs"
                  style={{
                    background: isCurrent ? "var(--chart-1)" : "var(--chart-5)",
                    width: `${((count / (peerLeader || 1)) * 100).toFixed(1)}%`,
                  }}
                />
              </span>
              <span className="w-16 text-right font-semibold text-sm tabular-nums">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={count}
                />
              </span>
            </div>
          );
        })}
      </div>
      <SourceNote>
        The largest makes by registrations in the period, always including{" "}
        {make}.
      </SourceNote>
    </section>
  );
}
