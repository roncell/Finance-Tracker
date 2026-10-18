CREATE TABLE "connected_banks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text NOT NULL,
	"plaid_item_id" text NOT NULL,
	"cursor" text,
	CONSTRAINT "connected_banks_plaid_item_id_unique" UNIQUE("plaid_item_id")
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "plaid_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_plaid_id_unique" UNIQUE("plaid_id");