-- Better Auth 1.7 adds accounts.issuer as the stable identity key, paired with
-- account_id under a unique index. drizzle-kit generates a bare
-- `ADD COLUMN ... NOT NULL`, which aborts on a populated table, so the column is
-- added nullable, backfilled, and only then constrained.
--
-- Backfill values mirror how Better Auth 1.7 resolves an issuer at sign-in
-- (packages/better-auth/src/oauth2/account-key.ts):
--   issuer = provider.accountIssuer ?? createOAuthAccountIssuer(provider.id)
-- Google declares accountIssuer = "https://accounts.google.com", and its
-- accountSubject is profile.sub — already what account_id holds. Getting this
-- wrong orphans existing logins, so the Google case is set explicitly and the
-- remaining cases fall back to the synthetic namespaces Better Auth would mint.
ALTER TABLE "accounts" ADD COLUMN "issuer" text;--> statement-breakpoint

UPDATE "accounts" SET "issuer" = 'https://accounts.google.com'
  WHERE "issuer" IS NULL AND "provider_id" = 'google';--> statement-breakpoint

-- Local credential accounts: createLocalAccountIssuer(providerId) => local:<id>
UPDATE "accounts" SET "issuer" = 'local:' || "provider_id"
  WHERE "issuer" IS NULL AND "provider_id" IN ('credential', 'email', 'phone');--> statement-breakpoint

-- Any other OAuth provider without an issuer of its own:
-- createOAuthAccountIssuer(providerId) => local:oauth:<id>
UPDATE "accounts" SET "issuer" = 'local:oauth:' || "provider_id"
  WHERE "issuer" IS NULL;--> statement-breakpoint

ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_issuer_accountId_uidx" ON "accounts" USING btree ("issuer","account_id");
