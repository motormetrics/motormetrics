import { CoeResultsLive } from "@web/components/coe-results-live";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

type Snapshot = { status: string; data?: unknown[] };
type State = { status: string };

const state = vi.hoisted(() => ({ pathname: "/coe" }));
const refresh = vi.hoisted(() => vi.fn());

const realtime = vi.hoisted(() => {
  const listeners = {
    change: [] as ((snapshot: Snapshot) => void)[],
    state: [] as ((state: State) => Promise<void> | void)[],
  };
  const subscription = {
    onChange: vi.fn((listener: (snapshot: Snapshot) => void) => {
      listeners.change.push(listener);
      return () => {};
    }),
    onStateChange: vi.fn((listener: (state: State) => Promise<void> | void) => {
      listeners.state.push(listener);
      return () => {};
    }),
    renew: vi.fn(async () => {}),
    unsubscribe: vi.fn(),
  };
  const client = { subscribe: vi.fn(() => subscription), close: vi.fn() };
  return { listeners, subscription, client };
});

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  useRouter: () => ({ refresh }),
}));

vi.mock("@neon/realtime/client", () => ({
  createRealtimeClient: vi.fn(() => realtime.client),
}));

import { createRealtimeClient } from "@neon/realtime/client";

const SEALED = { capability: "sealed", expiresAt: 1, queryFingerprint: "fp" };
const LIVE = { status: "live", query: SEALED };
const PENDING = { status: "pending" };
const ready = (offsetMs: number) => ({
  status: "ready",
  updatedAt: performance.timeOrigin + offsetMs,
});
// Revalidated after this page was requested, so the page is stale.
const READY_AFTER_LOAD = ready(1000);
// Revalidated before this page was requested, so the page is fresh.
const READY_BEFORE_LOAD = ready(-1000);

const ROW = { month: "2026-11", bidding_no: 2 };

const respondWith = (...responses: (object | null)[]) => {
  const fetchMock = vi.spyOn(globalThis, "fetch");
  for (const body of responses) {
    fetchMock.mockResolvedValueOnce(
      body === null
        ? new Response(null, { status: 204 })
        : Response.json(body, { status: 200 }),
    );
  }
  return fetchMock;
};

const emitChange = (snapshot: Snapshot) => {
  for (const listener of realtime.listeners.change) {
    listener(snapshot);
  }
};

const emitState = async (state: State) => {
  for (const listener of realtime.listeners.state) {
    await listener(state);
  }
};

// Wednesday 18 November 2026, as SGT wall-clock time.
const at = (time: string, date = "2026-11-18") =>
  vi.setSystemTime(new Date(`${date}T${time}:00+08:00`));

const renderAndListen = async () => {
  const screen = await render(<CoeResultsLive />);
  await vi.advanceTimersByTimeAsync(0);
  return screen;
};

// Renders, then waits until the sealed query from the route is subscribed.
const renderAndSubscribe = async () => {
  const screen = await renderAndListen();
  await vi.waitFor(() => expect(realtime.client.subscribe).toHaveBeenCalled());
  return screen;
};

describe("CoeResultsLive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    at("16:00");
    state.pathname = "/coe";
    realtime.listeners.change.length = 0;
    realtime.listeners.state.length = 0;
    process.env.NEXT_PUBLIC_NEON_REALTIME_URL = "wss://realtime.example";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("should refresh once the arrived results are revalidated", async () => {
    respondWith(LIVE, READY_AFTER_LOAD);
    await renderAndSubscribe();

    expect(createRealtimeClient).toHaveBeenCalledWith({
      url: "wss://realtime.example",
    });
    expect(realtime.client.subscribe).toHaveBeenCalledWith(SEALED);

    emitChange({ status: "live", data: [] });
    expect(refresh).not.toHaveBeenCalled();

    emitChange({ status: "live", data: [ROW] });
    expect(realtime.subscription.unsubscribe).toHaveBeenCalled();
    expect(realtime.client.close).toHaveBeenCalled();
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  });

  it("should refresh even when the revalidation predates the page", async () => {
    // The page saw the rows arrive live, so it renders the old results.
    respondWith(LIVE, READY_BEFORE_LOAD);
    await renderAndSubscribe();

    emitChange({ status: "live", data: [ROW] });

    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  });

  it("should wait for the cache revalidation before refreshing", async () => {
    const fetchMock = respondWith(LIVE, PENDING, PENDING, READY_AFTER_LOAD);
    await renderAndSubscribe();

    emitChange({ status: "live", data: [ROW] });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(refresh).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(5_000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(refresh).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(5_000);
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  });

  it("should listen on nested COE pages", async () => {
    state.pathname = "/coe/results";
    respondWith(LIVE);
    await renderAndSubscribe();

    expect(realtime.client.subscribe).toHaveBeenCalledWith(SEALED);
  });

  it("should not subscribe when the route has nothing to seal", async () => {
    const fetchMock = respondWith(null);
    await renderAndListen();

    expect(fetchMock).toHaveBeenCalledWith("/api/coe/live", {
      cache: "no-store",
    });
    expect(createRealtimeClient).not.toHaveBeenCalled();
  });

  it("should refresh a page requested before the revalidation", async () => {
    const fetchMock = respondWith(PENDING, READY_AFTER_LOAD);
    await renderAndListen();
    await vi.advanceTimersByTimeAsync(5_000);

    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(createRealtimeClient).not.toHaveBeenCalled();
  });

  it("should leave a page requested after the revalidation alone", async () => {
    const fetchMock = respondWith(READY_BEFORE_LOAD);
    await renderAndListen();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(refresh).not.toHaveBeenCalled();
    expect(createRealtimeClient).not.toHaveBeenCalled();
  });

  it("should wait for the window to open before fetching", async () => {
    at("15:50");
    const fetchMock = respondWith(LIVE);
    await renderAndListen();
    expect(fetchMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("should close the subscription when the window ends", async () => {
    respondWith(LIVE);
    await renderAndSubscribe();

    await vi.advanceTimersByTimeAsync(45 * 60 * 1000);

    expect(realtime.subscription.unsubscribe).toHaveBeenCalled();
    expect(realtime.client.close).toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("should renew an expired sealed query", async () => {
    respondWith(LIVE, LIVE);
    await renderAndSubscribe();

    await emitState({ status: "stale" });

    await vi.waitFor(() =>
      expect(realtime.subscription.renew).toHaveBeenCalledWith(SEALED),
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it("should refresh when the query expires after the results arrived", async () => {
    respondWith(LIVE, READY_AFTER_LOAD);
    await renderAndSubscribe();

    await emitState({ status: "stale" });

    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(realtime.subscription.renew).not.toHaveBeenCalled();
    expect(realtime.client.close).toHaveBeenCalled();
  });

  it.each([
    ["outside the window", "/coe", "16:45", "2026-11-18"],
    ["at the weekend", "/coe", "16:00", "2026-11-21"],
    ["on a page without COE results", "/cars", "16:00", "2026-11-18"],
  ])("should do nothing %s", async (_, pathname, time, date) => {
    state.pathname = pathname;
    at(time, date);
    const fetchMock = respondWith(LIVE);
    await renderAndListen();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
