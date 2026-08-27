import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

/**
 * Gates the /advertise page. Managed in Vercel Flags: on in Development, off in
 * Preview and Production. Toggle with `vercel flags enable|disable advertise-page
 * --environment <env>`, or override per-session from the Vercel Toolbar.
 */
export const advertisePage = flag<boolean>({
  key: "advertise-page",
  description: "Show the /advertise page",
  defaultValue: false,
  options: [
    { value: false, label: "Hidden" },
    { value: true, label: "Visible" },
  ],
  adapter: vercelAdapter(),
});

/**
 * Precomputed in `proxy.ts`: the proxy resolves these flags once and encodes the
 * result into the rewritten URL, so /advertise stays statically prerendered
 * instead of rendering per request.
 */
export const advertiseFlags = [advertisePage] as const;
