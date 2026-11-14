// Drizzle v1 exposes relations through `defineRelations` rather than the
// `relations()` blocks the default adapter entry point expects, so the adapter
// has to come from the relations-v2 export to read them.
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "@motormetrics/database/client";
import {
  accounts,
  sessions,
  users,
  verifications,
} from "@motormetrics/database/schema";
import { ac, admin, user } from "@web/lib/permissions";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, oAuthProxy } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "motormetrics.app",
      "*.motormetrics.app",
      "*.vercel.app",
      "localhost:3000",
      "motormetrics.localhost",
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
    "https://motormetrics.localhost",
  ],
  advanced: {
    // Required from 1.7: forwarded headers are no longer trusted by default,
    // so baseURL.allowedHosts cannot resolve the Vercel host without this.
    trustedProxyHeaders: true,
  },
  plugins: [
    adminPlugin({ ac, roles: { admin, user } }),
    // Previews sign in through production's Google callback, since Google
    // accepts no wildcard redirect URIs. The literal comes first because Vercel
    // picks the shortest production domain and sgcarstrends.com ties with
    // motormetrics.app.
    // TODO: on 1 Dec 2026, along with PR #1511, remove the literal so only
    // VERCEL_PROJECT_PRODUCTION_URL is left.
    oAuthProxy({
      productionURL:
        // @ts-expect-error TS2872: the literal is always truthy until the TODO above is done.
        "https://motormetrics.app" ||
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
      secret: process.env.OAUTH_PROXY_SECRET,
    }),
    nextCookies(), // Make sure this is the last plugin in the array
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
