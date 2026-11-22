CREATE TABLE "coe_interim_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"month" text NOT NULL,
	"bidding_no" integer NOT NULL,
	"vehicle_class" text NOT NULL,
	"quota" integer NOT NULL,
	"bids_success" integer NOT NULL,
	"bids_received" integer NOT NULL,
	"premium" integer NOT NULL,
	CONSTRAINT "coe_interim_results_month_bidding_no_vehicle_class_unique" UNIQUE("month","bidding_no","vehicle_class")
);
--> statement-breakpoint
CREATE INDEX "coe_interim_results_month_bidding_no_index" ON "coe_interim_results" ("month","bidding_no");