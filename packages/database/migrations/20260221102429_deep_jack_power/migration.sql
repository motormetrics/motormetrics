CREATE TABLE "car_population" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" text NOT NULL,
	"make" text NOT NULL,
	"fuel_type" text,
	"number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "car_population_year_make_index" ON "car_population" USING btree ("year","make");--> statement-breakpoint
CREATE INDEX "car_population_year_fuel_type_index" ON "car_population" USING btree ("year","fuel_type");--> statement-breakpoint
CREATE INDEX "car_population_year_index" ON "car_population" USING btree ("year");--> statement-breakpoint
CREATE INDEX "car_population_make_index" ON "car_population" USING btree ("make");--> statement-breakpoint
CREATE INDEX "car_population_fuel_type_index" ON "car_population" USING btree ("fuel_type");