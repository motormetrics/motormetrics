CREATE TABLE "vehicle_population" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" text NOT NULL,
	"category" text NOT NULL,
	"fuel_type" text NOT NULL,
	"number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "vehicle_population_year_category_index" ON "vehicle_population" USING btree ("year","category");--> statement-breakpoint
CREATE INDEX "vehicle_population_year_fuel_type_index" ON "vehicle_population" USING btree ("year","fuel_type");--> statement-breakpoint
CREATE INDEX "vehicle_population_year_index" ON "vehicle_population" USING btree ("year");--> statement-breakpoint
CREATE INDEX "vehicle_population_category_index" ON "vehicle_population" USING btree ("category");--> statement-breakpoint
CREATE INDEX "vehicle_population_fuel_type_index" ON "vehicle_population" USING btree ("fuel_type");