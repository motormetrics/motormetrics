import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

/** Gates /advertise. Independent of advertise-nav. */
export const advertisePage = flag<boolean>({
  key: "advertise-page",
  defaultValue: false,
  adapter: vercelAdapter(),
});
