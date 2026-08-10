ALTER TABLE "coe" ALTER COLUMN "bidding_no" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "quota" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "quota" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "bids_success" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "bids_success" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "bids_received" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "bids_received" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "premium" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "premium" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pqp" ALTER COLUMN "pqp" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pqp" ALTER COLUMN "pqp" SET NOT NULL;