CREATE TABLE "dish_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"dish_name" text NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_dish_unique" UNIQUE("user_id","dish_name")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "region" text;