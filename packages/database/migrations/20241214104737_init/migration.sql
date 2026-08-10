CREATE TABLE IF NOT EXISTS "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text,
	"make" text,
	"importer_type" text,
	"fuel_type" text,
	"vehicle_type" text,
	"number" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text,
	"bidding_no" integer,
	"vehicle_class" text,
	"quota" integer,
	"bids_success" integer,
	"bids_received" integer,
	"premium" integer
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "month_make_idx" ON "cars" USING btree ("month","make");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "month_idx" ON "cars" USING btree ("month");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "make_idx" ON "cars" USING btree ("make");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fuel_type_idx" ON "cars" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "make_fuel_type_idx" ON "cars" USING btree ("make","fuel_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "number_idx" ON "cars" USING btree ("number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "month_vehicle_idx" ON "coe" USING btree ("month","vehicle_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicle_class_idx" ON "coe" USING btree ("vehicle_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "month_bidding_no_idx" ON "coe" USING btree ("month","bidding_no");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "premium_idx" ON "coe" USING btree ("premium");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bids_idx" ON "coe" USING btree ("bids_success","bids_received");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "month_bidding_no_vehicle_class_idx" ON "coe" USING btree ("month" DESC NULLS LAST,"bidding_no" DESC NULLS LAST,"vehicle_class");