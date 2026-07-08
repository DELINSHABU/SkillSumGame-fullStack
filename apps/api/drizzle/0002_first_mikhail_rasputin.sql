ALTER TABLE "game_sessions" ADD COLUMN "client_session_id" uuid;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "played_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_game_sessions_client_id" ON "game_sessions" USING btree ("user_id","client_session_id");