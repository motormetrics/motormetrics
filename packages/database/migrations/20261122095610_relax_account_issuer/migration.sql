DROP INDEX "accounts_issuer_accountId_uidx";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "issuer" DROP NOT NULL;