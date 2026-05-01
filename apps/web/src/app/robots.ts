import { SITE_URL } from "@web/config";
import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => {
  const protectedPaths = ["/api/", "/_next/data/"];
  const sitemap = `${SITE_URL}/sitemap.xml`;

  if (process.env.VERCEL_ENV !== "production") {
    return {
      rules: [
        { userAgent: "*", disallow: "/" },
        { userAgent: "*", allow: "/api/og/" },
        { userAgent: "AhrefsSiteAudit", allow: "/", disallow: protectedPaths },
        {
          userAgent: "AhrefsSiteAudit",
          allow: "/_next/static/",
          disallow: protectedPaths,
        },
        {
          userAgent: "AhrefsSiteAudit",
          allow: "/public/x5wwykuhfx3gazs9h8y3fq9fxtnmv9zw.txt",
          disallow: protectedPaths,
        },
      ],
      sitemap,
    };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", allow: "/_next/static/" },
      { userAgent: "*", disallow: protectedPaths },
      { userAgent: "*", allow: "/api/og/" },
    ],
    sitemap,
  };
};

export default robots;
