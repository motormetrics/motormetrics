import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

/** Gates /advertise. Independent of advertise-nav. */
export const advertisePage = flag<boolean>({
  key: "advertise-page",
  defaultValue: false,
  adapter: vercelAdapter(),
});

/** Advertise in More menu and footer. Independent of advertise-page. */
export const advertiseNav = flag<boolean>({
  key: "advertise-nav",
  defaultValue: false,
  adapter: vercelAdapter(),
});

/** Blog in the More menu. The /blog route stays live either way. */
export const blogNav = flag<boolean>({
  key: "blog-nav",
  defaultValue: false,
  adapter: vercelAdapter(),
});

/** Popular posts on blog pages. */
export const blogPopularPosts = flag<boolean>({
  key: "blog-popular-posts",
  defaultValue: false,
  adapter: vercelAdapter(),
});

/** Instagram, Telegram, and GitHub promotional UI (not X/Twitter). */
export const socialLinks = flag<boolean>({
  key: "social-links",
  defaultValue: false,
  adapter: vercelAdapter(),
});
