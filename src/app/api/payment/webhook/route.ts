import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UDDOKTAPAY_WEBHOOK_SECRET = process.env.UDDOKTAPAY_WEBHOOK_SECRET;

/**
 * POST /api/payment/webhook
 * Handles payment status updates (callbacks) from UddoktaPay.
 * Verifies the webhook, updates transaction status, and user balance.
 * This route is NOT protected by Firebase ID token verification as it's called by the payment gateway.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming webhook payload
    const payload = await req.json();
    const {
      status, // Payment status from UddoktaPay (e.g., 'completed', 'failed', 'cancelled')
      transaction_id: gateway_transaction_id, // UddoktaPay's unique transaction ID
      metadata, // Custom metadata passed during initiation, containing user_uid and transaction_id
    } = payload;

    // 2. Webhook Security Verification
    const providedSecret = req.headers.get('X-UddoktaPay-Secret'); // Example header
    if (
      !UDDOKTAPAY_WEBHOOK_SECRET ||
      !providedSecret ||
      providedSecret !== UDDOKTAPAY_WEBHOOK_SECRET
    ) {
      console.warn('[PaymentWebhook] Unauthorized webhook: Invalid secret.');
      return NextResponse.json(
        { message: 'Unauthorized: Invalid secret' },
        { status: 401 }
      );
    }

    // 3. Validate essential payload data
    if (!gateway_transaction_id || !metadata?.transaction_id || !metadata?.user_uid) {
      console.error('[PaymentWebhook] Missing required payload data:', payload);
      return NextResponse.json(
        { message: 'Bad Request: Missing essential data' },
        { status: 400 }
      );
    }

    const ourTransactionId = parseInt(metadata.transaction_id, 10);
    const user_uid = metadata.user_uid;

    if (isNaN(ourTransactionId)) {
      return NextResponse.json(
        { message: 'Invalid internal transaction ID' },
        { status: 400 }
      );
    }

    // 4. Find our internal transaction record
    const transaction = await prisma.transaction.findUnique({
      where: { id: ourTransactionId },
    });

    if (!transaction) {
      console.error(`[PaymentWebhook] Transaction not found: ${ourTransactionId}`);
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    // 5. Idempotency check
    if (transaction.status === 'completed') {
      console.log(
        `[PaymentWebhook] Transaction ${ourTransactionId} already completed. Ignoring duplicate webhook.`
      );
      return NextResponse.json(
        { message: 'Transaction already processed' },
        { status: 200 }
      );
    }

    // 6. Process payment status
    if (status === 'completed' || status === 'success') {
      // Mark transaction completed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          gateway_transaction_id,
          description: transaction.description + ' (Completed via webhook)',
        },
      });

      // Update user balance
      const user = await prisma.user.update({
        where: { uid: user_uid },
        data: {
          accountBalance: {
            increment: transaction.amount,
          },
        },
      });

      console.log(
        `[PaymentWebhook] User ${user_uid} balance updated by ${transaction.amount}. New balance: ${user.accountBalance}`
      );

      return NextResponse.json(
        { message: 'Webhook processed: Payment completed' },
        { status: 200 }
      );
    } else if (['failed', 'cancelled', 'expired'].includes(status)) {
      // Mark transaction failed/cancelled
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status,
          gateway_transaction_id,
          description: transaction.description + ` (Status: ${status} via webhook)`,
        },
      });

      console.log(`[PaymentWebhook] Transaction ${ourTransactionId} marked as ${status}.`);

      return NextResponse.json(
        { message: `Webhook processed: Payment ${status}` },
        { status: 200 }
      );
    } else {
      console.warn(
        `[PaymentWebhook] Unhandled status: ${status} for transaction ${ourTransactionId}. Payload:`,
        payload
      );
      return NextResponse.json({ message: 'Unhandled payment status' }, { status: 200 });
    }
  } catch (error) {
    console.error('[PaymentWebhook] Error processing webhook:', error);
    return NextResponse.json(
      { message: 'Internal server error while processing webhook' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
