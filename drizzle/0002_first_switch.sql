CREATE TABLE "buyer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"max_budget" numeric(12, 2),
	"min_margin_pct" numeric(5, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "buyer_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "match_score" integer;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_buyer_profile_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_profile_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE set null ON UPDATE no action;