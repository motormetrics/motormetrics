import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

/** Gates /advertise. On in development, off in preview and production. */
export const advertisePage = flag<boolean>({
  key: "advertise-page",
  defaultValue: false,
  adapter: vercelAdapter(),
});
