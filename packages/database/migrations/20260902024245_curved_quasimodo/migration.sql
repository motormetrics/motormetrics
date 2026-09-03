CREATE TABLE "ev_charging_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ev_cp_id" text NOT NULL UNIQUE,
	"registration_code" text NOT NULL,
	"operator" text NOT NULL,
	"outlets" integer DEFAULT 1 NOT NULL,
	"plug_type" text NOT NULL,
	"charging_speed_kw" double precision,
	"postal_code" text,
	"block_house_no" text,
	"street_name" text,
	"building_name" text,
	"floor_no" text,
	"lot_no" text,
	"publicly_accessible" boolean DEFAULT true NOT NULL,
	"longitude" double precision,
	"latitude" double precision,
	"registration_date" date,
	"parking_lot_type" text
);
--> statement-breakpoint
CREATE INDEX "ev_charging_points_operator_index" ON "ev_charging_points" ("operator");--> statement-breakpoint
CREATE INDEX "ev_charging_points_plug_type_index" ON "ev_charging_points" ("plug_type");--> statement-breakpoint
CREATE INDEX "ev_charging_points_registration_date_index" ON "ev_charging_points" ("registration_date");