import * as schema from "@motormetrics/database";
import { db } from "@motormetrics/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  trustedOrigins: ["https://*.motormetrics.app", "http://localhost:3000"],
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
