CREATE TABLE "ev_charging_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ev_cp_id" text NOT NULL,
	"location_id" text NOT NULL,
	"kind" text NOT NULL,
	"previous_value" text,
	"value" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ev_connector_status" (
	"ev_cp_id" text PRIMARY KEY,
	"location_id" text NOT NULL,
	"charger_id" text,
	"station_name" text,
	"address" text,
	"postal_code" text,
	"longitude" double precision,
	"latitude" double precision,
	"operator" text,
	"operation_hours" text,
	"position" text,
	"plug_type" text,
	"power_rating" text,
	"charging_speed_kw" double precision,
	"price" double precision,
	"price_type" text,
	"status" text NOT NULL,
	"status_changed_at" timestamp with time zone NOT NULL,
	"observed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ev_location_hourly" (
	"location_id" text,
	"hour" timestamp with time zone,
	"samples" integer DEFAULT 0 NOT NULL,
	"connector_samples" integer DEFAULT 0 NOT NULL,
	"occupied_samples" integer DEFAULT 0 NOT NULL,
	"unavailable_samples" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ev_location_hourly_pkey" PRIMARY KEY("location_id","hour")
);
--> statement-breakpoint
CREATE INDEX "ev_charging_events_ev_cp_id_observed_at_index" ON "ev_charging_events" ("ev_cp_id","observed_at");--> statement-breakpoint
CREATE INDEX "ev_charging_events_location_id_observed_at_index" ON "ev_charging_events" ("location_id","observed_at");--> statement-breakpoint
CREATE INDEX "ev_charging_events_kind_observed_at_index" ON "ev_charging_events" ("kind","observed_at");--> statement-breakpoint
CREATE INDEX "ev_connector_status_location_id_index" ON "ev_connector_status" ("location_id");--> statement-breakpoint
CREATE INDEX "ev_connector_status_operator_index" ON "ev_connector_status" ("operator");--> statement-breakpoint
CREATE INDEX "ev_connector_status_postal_code_index" ON "ev_connector_status" ("postal_code");--> statement-breakpoint
CREATE INDEX "ev_location_hourly_hour_index" ON "ev_location_hourly" ("hour");