import { cn, Skeleton } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import type { MakeSectionProps } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import {
  BarHeader,
  BarRow,
} from "@web/app/(main)/(dashboard)/cars/makes/components/bar-row";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import Link from "next/link";
import { Suspense } from "react";

async function PeersCaption({ report }: Pick<MakeSectionProps, "report">) {
  const { periodCaption } = await report;

  return `${periodCaption} · all fuel types`;
}

/** One bar per make against the leader, the current make picked out. */
async function PeerRows({ make, report }: MakeSectionProps) {
  const { logoUrlBySlug, peers } = await report;
  const peerLeader = peers[0]?.count ?? 0;

  return (
    <>
      <BarHeader label="Make" value="Cars" />
      {peers.map(({ count, make: peerMake }) => {
        const isCurrent = peerMake === make;
        const slug = slugify(peerMake);
        return (
          <BarRow
            key={peerMake}
            label={
              <>
                <MakeAvatar
                  logoUrl={logoUrlBySlug[slug] ?? null}
                  make={peerMake}
                  size="sm"
                />
                <Link
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "truncate font-semibold no-underline hover:underline",
                    isCurrent
                      ? "text-accent"
                      : "text-foreground hover:text-accent",
                  )}
                  href={`/cars/makes/${slug}`}
                >
                  {peerMake}
                </Link>
              </>
            }
            percent={(count / (peerLeader || 1)) * 100}
            value={
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={count}
              />
            }
          />
        );
      })}
    </>
  );
}

/**
 * The largest makes in the period, the current make always among them. The
 * heading and the note are in the static shell; the caption and the bars wait
 * behind their own boundaries.
 */
export function MakePeers({ make, report }: MakeSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4" id="make-peers">
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={"\u00a0"}>
            <PeersCaption report={report} />
          </Suspense>
        }
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Against other makes"
      />
      <div className="flex flex-col">
        <Suspense fallback={<Skeleton className="h-56 w-full" />}>
          <PeerRows make={make} report={report} />
        </Suspense>
      </div>
      <SourceNote>
        The largest makes by registrations in the period, always including{" "}
        {make}.
      </SourceNote>
    </section>
  );
}
