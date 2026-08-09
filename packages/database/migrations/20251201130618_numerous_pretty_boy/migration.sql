DROP TABLE "analytics" CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "hero_image" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "highlights" jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" text DEFAULT 'draft';