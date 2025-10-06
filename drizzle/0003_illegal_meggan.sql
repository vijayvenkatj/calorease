CREATE TABLE "food_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dish_name" text NOT NULL,
	"calories" numeric(8, 2) NOT NULL,
	"carbohydrates" numeric(8, 2) NOT NULL,
	"protein" numeric(8, 2) NOT NULL,
	"fats" numeric(8, 2) NOT NULL,
	"free_sugar" numeric(8, 2) DEFAULT '0',
	"fibre" numeric(8, 2) DEFAULT '0',
	"sodium" numeric(8, 2) DEFAULT '0',
	"calcium" numeric(8, 2) DEFAULT '0',
	"iron" numeric(8, 2) DEFAULT '0',
	"vitamin_c" numeric(8, 2) DEFAULT '0',
	"folate" numeric(8, 2) DEFAULT '0',
	"is_custom" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
