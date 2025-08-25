import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function POST(req: NextRequest) {
  try {
    // Removed connectMongo() as it's no longer needed
    const body = await req.json();

    const { amount, status, transaction_id, metadata } = body;
    const { user_uid } = metadata;

    if (!user_uid || !transaction_id) {
      return NextResponse.json(
        { message: "Missing user_uid or transaction_id" },
        { status: 400 }
      );
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { gateway_transaction_id: transaction_id },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { message: "Transaction already processed" },
        { status: 200 }
      );
    }

    try {
      await prisma.$transaction(async (tx) => {
        if (status === "COMPLETED") {
          await tx.transaction.create({
            data: {
              user_uid,
              amount,
              type: "deposit",
              status: "completed",
              gateway_transaction_id: transaction_id,
              description: "Deposit from Uddokta",
            },
          });

          const user = await tx.user.findUnique({ where: { uid: user_uid } });
          if (!user) {
            throw new Error("User not found");
          }

          await tx.user.update({
            where: { uid: user_uid },
            data: {
              accountBalance: {
                increment: amount,
              },
            },
          });
        } else {
          await tx.transaction.create({
            data: {
              user_uid,
              amount,
              type: "deposit",
              status: "failed",
              gateway_transaction_id: transaction_id,
              description: "Failed deposit from Uddokta",
            },
          });
        }
      });

      return NextResponse.json({ message: "Callback processed successfully" });
    } catch (error) {
      console.error("Transaction error:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Callback processing error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}