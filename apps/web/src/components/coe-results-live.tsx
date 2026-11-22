"use client";

import {
  createRealtimeClient,
  type SealedLiveQuery,
} from "@neon/realtime/client";
import { getResultsWindow } from "@web/lib/coe/results-window";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// The home page and every /coe page show COE results.
const COE_RESULTS_ROUTE_PATTERN = /^\/(coe(\/|$))?$/;

type InterimRow = { month: string; bidding_no: number };

/** The sealed live query, or `null` when there is nothing to watch. */
const fetchLiveQuery =
  async (): Promise<SealedLiveQuery<InterimRow> | null> => {
    const response = await fetch("/api/coe/live", { cache: "no-store" });
    return response.status === 200 ? response.json() : null;
  };

/**
 * Refreshes a COE page once when the day's results arrive.
 *
 * Only during the weekday results window (15:55–16:45 SGT) does it fetch a
 * sealed query and open a Neon Realtime subscription on `coe_interim_results`.
 * The first change that brings rows refreshes the page, so server components
 * re-read the revalidated COE queries, and the subscription closes at once.
 * Outside the window it does nothing.
 */
export function CoeResultsLive() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_NEON_REALTIME_URL;
    const resultsWindow = getResultsWindow(new Date());
    if (!url || !resultsWindow || !COE_RESULTS_ROUTE_PATTERN.test(pathname)) {
      return;
    }

    let closed = false;
    let close = () => {
      closed = true;
    };

    const listen = async () => {
      const sealed = await fetchLiveQuery();
      if (!sealed || closed) {
        return;
      }

      const client = createRealtimeClient({ url });
      const subscription = client.subscribe(sealed);
      close = () => {
        closed = true;
        subscription.unsubscribe();
        client.close();
      };

      subscription.onChange(({ status, data }) => {
        if (status === "live" && data && data.length > 0) {
          close();
          router.refresh();
        }
      });
      subscription.onStateChange(async (state) => {
        if (state.status !== "stale") {
          return;
        }
        // The sealed query expired: renew it, unless the results arrived in
        // the meantime and the route has nothing left to seal.
        const renewed = await fetchLiveQuery();
        if (closed) {
          return;
        }
        if (renewed) {
          await subscription.renew(renewed);
        } else {
          close();
          router.refresh();
        }
      });
    };

    const now = Date.now();
    const startTimer = setTimeout(
      () => {
        listen().catch(() => close());
      },
      Math.max(resultsWindow.start - now, 0),
    );
    const endTimer = setTimeout(() => close(), resultsWindow.end - now);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      close();
    };
  }, [pathname, router]);

  return null;
}
