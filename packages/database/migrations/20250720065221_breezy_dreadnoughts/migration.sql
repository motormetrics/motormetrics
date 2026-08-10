CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp with time zone DEFAULT now(),
	"pathname" text NOT NULL,
	"referrer" text,
	"country" text,
	"flag" text,
	"city" text,
	"latitude" text,
	"longitude" text
);
