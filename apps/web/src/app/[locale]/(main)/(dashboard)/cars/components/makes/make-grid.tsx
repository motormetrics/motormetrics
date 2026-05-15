import { slugify } from "@motormetrics/utils";
import type { Make, MakeStats } from "@web/types";
import { MakeCard } from "./make-card";

interface MakeGridProps {
  makes: Make[];
  logoUrlMap?: Record<string, string>;
  makeStatsMap?: Record<string, MakeStats>;
}

export function MakeGrid({
  makes,
  logoUrlMap = {},
  makeStatsMap,
}: MakeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {makes.map((make) => {
        const stats = makeStatsMap?.[make];
        return (
          <MakeCard
            key={make}
            make={make}
            logoUrl={logoUrlMap[slugify(make)]}
            count={stats?.count}
            share={stats?.share}
            trend={stats?.trend}
            yoyChange={stats?.yoyChange}
          />
        );
      })}
    </div>
  );
}
