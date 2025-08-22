
import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { TransactionModel }d from "@/models/Transaction";
import mongoose from "mongoose";
import { connectToDB } from "@/config/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const body = await req.json();

    const { amount, status, transaction_id, metadata } = body;
    const { user_uid } = metadata;

    if (!user_uid || !transaction_id) {
      return NextResponse.json(
        { message: "Missing user_uid or transaction_id" },
        { status: 400 }
      );
    }

    const existingTransaction = await TransactionModel.findOne({
      gateway_transaction_id: transaction_id,
    });

    if (existingTransaction) {
      return NextResponse.json(
        { message: "Transaction already processed" },
        { status: 200 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (status === "COMPLETED") {
        const newTransaction = new TransactionModel({
          user_uid,
          amount,
          type: "deposit",
          status: "completed",
          gateway_transaction_id: transaction_id,
          description: "Deposit from Uddokta",
        });

        await newTransaction.save({ session });

        const user = await UserModel.findOne({ uid: user_uid }).session(session);
        if (!user) {
          throw new Error("User not found");
        }

        user.accountBalance += amount;
        await user.save({ session });
      } else {
        const newTransaction = new TransactionModel({
          user_uid,
          amount,
          type: "deposit",
          status: "failed",
          gateway_transaction_id: transaction_id,
          description: "Failed deposit from Uddokta",
        });

        await newTransaction.save({ session });
      }

      await session.commitTransaction();
      return NextResponse.json({ message: "Callback processed successfully" });
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction error:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Callback processing error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
