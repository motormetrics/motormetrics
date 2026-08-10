// Drizzle v1 exposes relations through `defineRelations` rather than the
// `relations()` blocks the default adapter entry point expects, so the adapter
// has to come from the relations-v2 export to read them.
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import {
  accounts,
  db,
  sessions,
  users,
  verifications,
} from "@motormetrics/database";
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
    // Only the auth tables. This used to be the whole `@motormetrics/database`
    // namespace, which also handed the adapter `db`, every query helper, and
    // every unrelated table.
    schema: { accounts, sessions, users, verifications },
    usePlural: true,
  }),
  trustedOrigins: [
    "https://*.motormetrics.app",
    "https://*.vercel.app",
    "http://localhost:3000",
  ],
  advanced: {
    // Required from 1.7: forwarded headers are no longer trusted by default,
    // so baseURL.allowedHosts cannot resolve the Vercel host without this.
    trustedProxyHeaders: true,
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
