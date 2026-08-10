ALTER TABLE "car_population" RENAME CONSTRAINT "car_population_year_make_fuelType_unique" TO "car_population_year_make_fuel_type_unique";--> statement-breakpoint
ALTER TABLE "cars" RENAME CONSTRAINT "cars_month_make_importerType_fuelType_vehicleType_unique" TO "cars_month_make_importer_type_fuel_type_vehicle_type_unique";--> statement-breakpoint
ALTER TABLE "coe" RENAME CONSTRAINT "coe_month_biddingNo_vehicleClass_unique" TO "coe_month_bidding_no_vehicle_class_unique";--> statement-breakpoint
ALTER TABLE "posts" RENAME CONSTRAINT "posts_month_dataType_unique" TO "posts_month_data_type_unique";--> statement-breakpoint
ALTER TABLE "pqp" RENAME CONSTRAINT "pqp_month_vehicleClass_unique" TO "pqp_month_vehicle_class_unique";--> statement-breakpoint
ALTER TABLE "vehicle_population" RENAME CONSTRAINT "vehicle_population_year_category_fuelType_unique" TO "vehicle_population_year_category_fuel_type_unique";