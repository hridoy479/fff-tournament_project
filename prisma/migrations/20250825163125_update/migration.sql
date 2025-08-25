-- AddForeignKey
ALTER TABLE "public"."TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
