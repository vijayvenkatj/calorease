CREATE TABLE "food_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meal_type" text NOT NULL,
	"food_name" text NOT NULL,
	"calories" numeric(8, 2) NOT NULL,
	"protein" numeric(8, 2) DEFAULT '0',
	"carbs" numeric(8, 2) DEFAULT '0',
	"fats" numeric(8, 2) DEFAULT '0',
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"age" integer NOT NULL,
	"gender" text NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"goals" text NOT NULL,
	"activity_level" text NOT NULL,
	"waist" numeric(5, 2),
	"hips" numeric(5, 2),
	"chest" numeric(5, 2),
	"arms" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_log_date" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_streaks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "water_intake_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_ml" integer NOT NULL,
	"logged_at" timestamp DEFAULT now() NOT NULL,
	"date" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_start_date" text NOT NULL,
	"days_logged" integer DEFAULT 0 NOT NULL,
	"total_calories" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_protein" numeric(8, 2) DEFAULT '0' NOT NULL,
	"total_carbs" numeric(8, 2) DEFAULT '0' NOT NULL,
	"total_fats" numeric(8, 2) DEFAULT '0' NOT NULL,
	"total_water_ml" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weight_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"date" text NOT NULL,
	"notes" text,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
