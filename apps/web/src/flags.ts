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
  adapter: vercelAdapter(),
});
