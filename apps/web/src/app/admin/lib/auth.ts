import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as schema from "@motormetrics/database";
import { db } from "@motormetrics/database";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "motormetrics.app",
      "*.motormetrics.app",
      "*.vercel.app",
      "localhost:3000",
    ],
    protocol: "auto",
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  trustedOrigins: [
    "https://*.motormetrics.app",
    "https://*.vercel.app",
    "http://localhost:3000",
  ],
  advanced: {
    trustedProxyHeaders: true,
    allowedHosts: [
      "motormetrics.app",
      "*.motormetrics.app",
      "*.vercel.app",
      "localhost:3000",
    ],
  },
  plugins: [
    admin(),
    nextCookies(), // Make sure this is the last plugin in the array
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
