ALTER TABLE "car_population" ADD CONSTRAINT "car_population_year_make_fuelType_unique" UNIQUE NULLS NOT DISTINCT("year","make","fuel_type");--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_month_make_importerType_fuelType_vehicleType_unique" UNIQUE NULLS NOT DISTINCT("month","make","importer_type","fuel_type","vehicle_type");--> statement-breakpoint
ALTER TABLE "coe" ADD CONSTRAINT "coe_month_biddingNo_vehicleClass_unique" UNIQUE("month","bidding_no","vehicle_class");--> statement-breakpoint
ALTER TABLE "pqp" ADD CONSTRAINT "pqp_month_vehicleClass_unique" UNIQUE("month","vehicle_class");--> statement-breakpoint
ALTER TABLE "deregistrations" ADD CONSTRAINT "deregistrations_month_category_unique" UNIQUE("month","category");--> statement-breakpoint
ALTER TABLE "vehicle_population" ADD CONSTRAINT "vehicle_population_year_category_fuelType_unique" UNIQUE("year","category","fuel_type");