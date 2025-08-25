-- CreateEnum
CREATE TYPE "public"."TournamentStatus" AS ENUM ('upcoming', 'started', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('deposit', 'withdrawal', 'tournament_entry', 'tournament_prize');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateTable
CREATE TABLE "public"."Tournament" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "entry_fee" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."TournamentStatus" NOT NULL DEFAULT 'upcoming',
    "image" TEXT,
    "prize" TEXT,
    "joined_players" INTEGER NOT NULL DEFAULT 0,
    "max_players" INTEGER,
    "category" TEXT NOT NULL,
    "ffGameType" TEXT,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "match_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TournamentPlayer" (
    "user_uid" TEXT NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "game_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentPlayer_pkey" PRIMARY KEY ("user_uid","tournament_id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "uid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "accountBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gameBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "role" "public"."UserRole" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Counter" (
    "id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" SERIAL NOT NULL,
    "user_uid" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'pending',
    "gateway_transaction_id" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "public"."User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_gateway_transaction_id_key" ON "public"."Transaction"("gateway_transaction_id");

-- AddForeignKey
ALTER TABLE "public"."TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
