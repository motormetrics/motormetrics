"use client";

import { createRealtimeClient } from "@neon/realtime/client";
import type { CoeLiveState } from "@web/app/api/coe/live/route";
import { getResultsWindow } from "@web/lib/coe/results-window";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// The home page and every /coe page show COE results.
const COE_RESULTS_ROUTE_PATTERN = /^\/$|^\/coe(?:\/|$)/;

/** How often to ask again while the stored results wait for revalidation. */
const PENDING_POLL_MS = 5_000;

/** The route's answer, or `null` when there is nothing to watch. */
const fetchLiveState = async (): Promise<CoeLiveState | null> => {
  const response = await fetch("/api/coe/live", { cache: "no-store" });
  return response.status === 200 ? response.json() : null;
};

/**
 * Refreshes a COE page once when the day's results are servable.
 *
 * Only during the weekday results window (15:55–16:45 SGT) does it ask
 * `/api/coe/live` what to do. Before the results land it opens a Neon Realtime
 * subscription on `coe_interim_results`; once rows arrive, it waits until the
 * route reports the COE cache revalidated, then refreshes so server components
 * re-read the fresh results. A page loaded around the time the results landed
 * refreshes too, unless it was requested after the revalidation. Outside the
 * window it does nothing.
 */
export function CoeResultsLive() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const url = process.env.NEON_REALTIME_URL;
    const resultsWindow = getResultsWindow(new Date());
    if (!url || !resultsWindow || !COE_RESULTS_ROUTE_PATTERN.test(pathname)) {
      return;
    }

    let closed = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let closeSubscription = () => {};
    const close = () => {
      closed = true;
      clearTimeout(pollTimer);
      closeSubscription();
    };

    const refreshOnce = () => {
      close();
      router.refresh();
    };

    // Acts on the route's answer until it reports the cache revalidated,
    // polling while it is pending. `stale` is whether this page is known to
    // predate the results (it saw them arrive live).
    const awaitReady = (state: CoeLiveState | null, stale: boolean) => {
      if (closed) {
        return;
      }
      if (state?.status === "ready") {
        // A page requested after the revalidation already shows the results.
        if (stale || state.updatedAt > performance.timeOrigin) {
          refreshOnce();
        } else {
          close();
        }
        return;
      }
      if (state?.status === "pending") {
        pollTimer = setTimeout(() => {
          fetchLiveState()
            .then((next) => awaitReady(next, stale))
            .catch(() => close());
        }, PENDING_POLL_MS);
        return;
      }
      // A fresh sealed query or a 204 here means the rows vanished or the
      // window closed; there is nothing left to refresh for.
      close();
    };

    const pollUntilReady = () =>
      fetchLiveState()
        .then((state) => awaitReady(state, true))
        .catch(() => close());

    const listen = async () => {
      const state = await fetchLiveState();
      if (closed || !state) {
        return;
      }
      if (state.status !== "live") {
        // The results landed before this page subscribed.
        awaitReady(state, false);
        return;
      }

      const client = createRealtimeClient({ url });
      const subscription = client.subscribe(state.query);
      closeSubscription = () => {
        subscription.unsubscribe();
        client.close();
      };

      subscription.onChange(({ status, data }) => {
        if (status === "live" && data && data.length > 0 && !closed) {
          closeSubscription();
          closeSubscription = () => {};
          pollUntilReady();
        }
      });
      subscription.onStateChange(async (realtimeState) => {
        if (realtimeState.status !== "stale") {
          return;
        }
        // The sealed query expired: renew it, unless the results arrived in
        // the meantime and the route has nothing left to seal.
        const renewed = await fetchLiveState();
        if (closed) {
          return;
        }
        if (renewed?.status === "live") {
          await subscription.renew(renewed.query);
        } else if (renewed) {
          closeSubscription();
          closeSubscription = () => {};
          awaitReady(renewed, true);
        } else {
          close();
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
