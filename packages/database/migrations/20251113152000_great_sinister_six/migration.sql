DROP INDEX "month_make_idx";--> statement-breakpoint
DROP INDEX "month_idx";--> statement-breakpoint
DROP INDEX "make_idx";--> statement-breakpoint
DROP INDEX "fuel_type_idx";--> statement-breakpoint
DROP INDEX "make_fuel_type_idx";--> statement-breakpoint
DROP INDEX "number_idx";--> statement-breakpoint
DROP INDEX "month_vehicle_idx";--> statement-breakpoint
DROP INDEX "vehicle_class_idx";--> statement-breakpoint
DROP INDEX "month_bidding_no_idx";--> statement-breakpoint
DROP INDEX "premium_idx";--> statement-breakpoint
DROP INDEX "bids_idx";--> statement-breakpoint
DROP INDEX "month_bidding_no_vehicle_class_idx";--> statement-breakpoint
DROP INDEX "pqp_month_vehicle_class_idx";--> statement-breakpoint
DROP INDEX "pqp_vehicle_class_idx";--> statement-breakpoint
DROP INDEX "pqp_idx";--> statement-breakpoint
CREATE INDEX "cars_month_make_index" ON "cars" USING btree ("month","make");--> statement-breakpoint
CREATE INDEX "cars_month_index" ON "cars" USING btree ("month");--> statement-breakpoint
CREATE INDEX "cars_make_index" ON "cars" USING btree ("make");--> statement-breakpoint
CREATE INDEX "cars_fuel_type_index" ON "cars" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "cars_make_fuel_type_index" ON "cars" USING btree ("make","fuel_type");--> statement-breakpoint
CREATE INDEX "cars_number_index" ON "cars" USING btree ("number");--> statement-breakpoint
CREATE INDEX "coe_month_vehicle_class_index" ON "coe" USING btree ("month","vehicle_class");--> statement-breakpoint
CREATE INDEX "coe_vehicle_class_index" ON "coe" USING btree ("vehicle_class");--> statement-breakpoint
CREATE INDEX "coe_month_bidding_no_index" ON "coe" USING btree ("month","bidding_no");--> statement-breakpoint
CREATE INDEX "coe_premium_index" ON "coe" USING btree ("premium");--> statement-breakpoint
CREATE INDEX "coe_bids_success_bids_received_index" ON "coe" USING btree ("bids_success","bids_received");--> statement-breakpoint
CREATE INDEX "coe_month_bidding_no_vehicle_class_index" ON "coe" USING btree ("month" DESC NULLS LAST,"bidding_no" DESC NULLS LAST,"vehicle_class");--> statement-breakpoint
CREATE INDEX "pqp_month_vehicle_class_index" ON "pqp" USING btree ("month","vehicle_class");--> statement-breakpoint
CREATE INDEX "pqp_vehicle_class_index" ON "pqp" USING btree ("vehicle_class");--> statement-breakpoint
CREATE INDEX "pqp_pqp_index" ON "pqp" USING btree ("pqp");