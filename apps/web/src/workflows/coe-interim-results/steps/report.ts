// Server-side capture goes straight to PostHog's capture API: apps/web has no
// server PostHog client, and one event does not warrant adding posthog-node.
const POSTHOG_CAPTURE_URL = "https://eu.i.posthog.com/i/v0/e/";

const PARSE_FAILED_EVENT = "coe_interim_results_parse_failed";

/**
 * Sends a PostHog event when the OneMotoring page has a closing heading but
 * cannot be read, so a PostHog alert can flag a layout change. Never throws:
 * a failed report must not hide the parse failure it is reporting.
 */
export const reportParseFailure = async (
  check: string,
  message: string,
): Promise<void> => {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) {
    console.warn("[COE INTERIM] No PostHog token; parse failure not reported");
    return;
  }

  try {
    const response = await fetch(POSTHOG_CAPTURE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: token,
        event: PARSE_FAILED_EVENT,
        distinct_id: "workflow:coe-interim-results",
        properties: { check, message },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(
        `[COE INTERIM] PostHog capture failed: HTTP ${response.status}`,
      );
    }
  } catch (error) {
    console.error("[COE INTERIM] PostHog capture failed:", error);
  }
};
