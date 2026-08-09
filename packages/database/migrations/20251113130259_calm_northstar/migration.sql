ALTER TABLE "cars" ALTER COLUMN "month" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "make" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "fuel_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "vehicle_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "number" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "month" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "vehicle_class" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "quota" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "bids_success" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "bids_received" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "coe" ALTER COLUMN "premium" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "coe_pqp" ALTER COLUMN "month" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coe_pqp" ALTER COLUMN "vehicle_class" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "coe_pqp" ALTER COLUMN "pqp" SET DEFAULT 0;