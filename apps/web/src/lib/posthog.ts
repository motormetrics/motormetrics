import { cacheLife, cacheTag } from "next/cache";

const POSTHOG_HOST = "https://eu.i.posthog.com";
const POSTHOG_PROJECT_ID = "100514";

interface TrafficStats {
  uniqueVisitors: number;
  pageViews: number;
  pagesPerVisitor: number;
}

interface DailyTraffic {
  date: string;
  visitors: number;
  pageViews: number;
}

async function queryPostHog(body: Record<string, unknown>) {
  const apiKey = process.env.POSTHOG_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    console.error("[PostHog] Query failed:", response.status);
    return null;
  }

  return response.json();
}

export async function getTrafficStats(): Promise<TrafficStats> {
  "use cache";
  cacheLife("days");
  cacheTag("posthog:stats");

  const result = await queryPostHog({
    query: {
      kind: "WebOverviewQuery",
      dateRange: { date_from: "-30d" },
      properties: [],
    },
  });

  if (!result?.results) {
    return { uniqueVisitors: 0, pageViews: 0, pagesPerVisitor: 0 };
  }

  const rows = result.results as Array<[string, number, number | null]>;
  const findValue = (key: string) =>
    rows.find((row) => row[0] === key)?.[1] ?? 0;

  const uniqueVisitors = findValue("visitors");
  const pageViews = findValue("pageviews");
  const pagesPerVisitor =
    uniqueVisitors > 0 ? Math.round((pageViews / uniqueVisitors) * 10) / 10 : 0;

  return { uniqueVisitors, pageViews, pagesPerVisitor };
}

export async function getDailyTraffic(): Promise<DailyTraffic[]> {
  "use cache";
  cacheLife("days");
  cacheTag("posthog:daily");

  const result = await queryPostHog({
    query: {
      kind: "HogQLQuery",
      query: `
        SELECT
          toDate(timestamp) AS date,
          uniq(distinct_id) AS visitors,
          count() AS page_views
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= now() - INTERVAL 30 DAY
        GROUP BY date
        ORDER BY date
      `,
    },
  });

  if (!result?.results) {
    return [];
  }

  return (result.results as Array<[string, number, number]>).map(
    ([date, visitors, pageViews]) => ({
      date,
      visitors,
      pageViews,
    }),
  );
}
