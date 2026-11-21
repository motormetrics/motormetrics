CREATE TABLE "coe_revalidation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"month" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"number" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "coe_revalidation_month_type_category_unique" UNIQUE("month","type","category")
);
--> statement-breakpoint
CREATE INDEX "coe_revalidation_month_category_index" ON "coe_revalidation" ("month","category");--> statement-breakpoint
CREATE INDEX "coe_revalidation_category_index" ON "coe_revalidation" ("category");