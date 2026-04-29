CREATE TABLE "car_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text NOT NULL,
	"sn" integer NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"coe_cat" text NOT NULL,
	"engine_capacity" text,
	"max_power_output" double precision NOT NULL,
	"fuel_type" text NOT NULL,
	"co2" double precision NOT NULL,
	"ves_banding" text NOT NULL,
	"omv" double precision NOT NULL,
	"gst_excise_duty" double precision NOT NULL,
	"arf" double precision NOT NULL,
	"ves_surcharge_rebate" double precision NOT NULL,
	"eeai" double precision NOT NULL,
	"registration_fee" double precision NOT NULL,
	"coe_premium" double precision NOT NULL,
	"total_basic_cost_without_coe" double precision NOT NULL,
	"total_basic_cost_with_coe" double precision NOT NULL,
	"selling_price_without_coe" double precision DEFAULT 0 NOT NULL,
	"selling_price_with_coe" double precision DEFAULT 0 NOT NULL,
	"difference_without_coe" double precision,
	"difference_with_coe" double precision,
	CONSTRAINT "car_costs_month_make_model_unique" UNIQUE("month","make","model")
);
--> statement-breakpoint
CREATE INDEX "car_costs_month_make_index" ON "car_costs" USING btree ("month","make");--> statement-breakpoint
CREATE INDEX "car_costs_month_index" ON "car_costs" USING btree ("month");--> statement-breakpoint
CREATE INDEX "car_costs_make_index" ON "car_costs" USING btree ("make");--> statement-breakpoint
CREATE INDEX "car_costs_fuel_type_index" ON "car_costs" USING btree ("fuel_type");