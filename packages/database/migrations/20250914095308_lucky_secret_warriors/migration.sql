ALTER TABLE "posts"
    ADD COLUMN "month" text;--> statement-breakpoint
ALTER TABLE "posts"
    ADD COLUMN "data_type" text;--> statement-breakpoint
ALTER TABLE "posts"
    ADD CONSTRAINT "posts_month_dataType_unique" UNIQUE ("month", "data_type");
