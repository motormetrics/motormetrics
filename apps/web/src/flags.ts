import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

/** Gates /advertise. Independent of advertise-nav. */
export const advertisePage = flag<boolean>({
  key: "advertise-page",
  defaultValue: false,
  adapter: vercelAdapter(),
});

/** Popular posts on blog pages. */
export const blogPopularPosts = flag<boolean>({
  key: "blog-popular-posts",
  defaultValue: false,
  adapter: vercelAdapter(),
});
