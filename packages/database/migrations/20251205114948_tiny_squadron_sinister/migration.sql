CREATE TABLE "deregistrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text NOT NULL,
	"category" text NOT NULL,
	"number" integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX "deregistrations_month_category_index" ON "deregistrations" USING btree ("month","category");--> statement-breakpoint
CREATE INDEX "deregistrations_month_index" ON "deregistrations" USING btree ("month");--> statement-breakpoint
CREATE INDEX "deregistrations_category_index" ON "deregistrations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "deregistrations_number_index" ON "deregistrations" USING btree ("number");
