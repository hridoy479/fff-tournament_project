import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb'; // MongoDB connection utility
import { UserModel } from '@/models/User'; // User Mongoose model
import { TransactionModel } from '@/models/Transaction'; // Transaction Mongoose model

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

const UDDOKTAPAY_WEBHOOK_SECRET = process.env.UDDOKTAPAY_WEBHOOK_SECRET;

/**
 * POST /api/payment/webhook
 * Handles payment status updates (callbacks) from UddoktaPay.
 * Verifies the webhook, updates transaction status, and user balance.
 * This route is NOT protected by Firebase ID token verification as it's called by the payment gateway.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Removed connectMongo() as it's no longer needed

    // 2. Parse the incoming webhook payload
    const payload = await req.json();
    const {
      status, // Payment status from UddoktaPay (e.g., 'completed', 'failed', 'cancelled')
      transaction_id: gateway_transaction_id, // UddoktaPay's unique transaction ID
      metadata, // Our custom metadata passed during initiation, containing user_uid and our transaction_id
      // Other fields from UddoktaPay webhook payload as per their documentation
    } = payload;

    // 3. Webhook Security Verification (CRITICAL)
    // You MUST implement the actual security verification as per UddoktaPay's documentation.
    // This might involve:
    //   - Checking a signature in a header (e.g., 'X-UddoktaPay-Signature')
    //   - Verifying a secret key sent in a header or as part of the payload
    //   - IP whitelisting (ensuring the request comes from UddoktaPay's servers)
    const providedSecret = req.headers.get('X-UddoktaPay-Secret'); // Example header name
    if (!UDDOKTAPAY_WEBHOOK_SECRET || !providedSecret || providedSecret !== UDDOKTAPAY_WEBHOOK_SECRET) {
      console.warn('[PaymentWebhook] Unauthorized webhook access attempt: Invalid secret.');
      return NextResponse.json({ message: 'Unauthorized: Invalid secret' }, { status: 401 });
    }
    // --- End Webhook Security Verification ---

    // 4. Validate essential payload data
    if (!gateway_transaction_id || !metadata || !metadata.transaction_id || !metadata.user_uid) {
      console.error('[PaymentWebhook] Missing required payload data:', payload);
      return NextResponse.json({ message: 'Bad Request: Missing essential data in payload' }, { status: 400 });
    }

    const ourTransactionId = metadata.transaction_id; // Our internal transaction ID
    const user_uid = metadata.user_uid; // Firebase UID of the user

    // 5. Find our internal transaction record
    const transaction = await prisma.transaction.findUnique({ where: { id: parseInt(ourTransactionId) } });

    if (!transaction) {
      console.error(`[PaymentWebhook] Transaction not found for internal ID: ${ourTransactionId}`);
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    // 6. Handle Idempotency: Prevent processing the same successful transaction multiple times
    if (transaction.status === 'completed') {
      console.log(`[PaymentWebhook] Transaction ${ourTransactionId} already completed. Ignoring duplicate webhook.`);
      return NextResponse.json({ message: 'Transaction already processed' }, { status: 200 });
    }

    // 7. Process based on UddoktaPay's status
    if (status === 'completed' || status === 'success') { // Adjust status strings as per UddoktaPay docs
      // Update our transaction record to completed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          gateway_transaction_id: gateway_transaction_id,
          description: transaction.description + ' (Completed via webhook)',
        },
      });

      // Update user's account balance atomically
      const user = await prisma.user.update({
        where: { uid: user_uid },
        data: {
          accountBalance: {
            increment: transaction.amount,
          },
        },
      });

      if (user) {
        console.log(`[PaymentWebhook] User ${user_uid} balance updated by ${transaction.amount}. New balance: ${user.accountBalance}`);
      } else {
        console.error(`[PaymentWebhook] User not found in PostgreSQL for UID: ${user_uid}. Balance not updated.`);
      }

      return NextResponse.json({ message: 'Webhook processed successfully: Payment completed' }, { status: 200 });
    } else if (status === 'failed' || status === 'cancelled' || status === 'expired') { // Adjust status strings as per UddoktaPay docs
      // Update our transaction record to failed/cancelled
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: status,
          gateway_transaction_id: gateway_transaction_id,
          description: transaction.description + ` (Status: ${status} via webhook)`,
        },
      });
      console.log(`[PaymentWebhook] Transaction ${ourTransactionId} marked as ${status}.`);
      return NextResponse.json({ message: `Webhook processed successfully: Payment ${status}` }, { status: 200 });
    } else {
      // Handle any other unrecognised status from UddoktaPay
      console.warn(`[PaymentWebhook] Unhandled status: ${status} for transaction ${ourTransactionId}. Payload:`, payload);
      return NextResponse.json({ message: 'Unhandled payment status' }, { status: 200 });
    }
  } catch (error) {
    console.error('[PaymentWebhook] Error processing UddoktaPay webhook:', error);
    return NextResponse.json({ message: 'Internal server error while processing webhook' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/payment/webhook
 * Handles payment status updates (callbacks) from UddoktaPay.
 * Verifies the webhook, updates transaction status, and user balance.
 * This route is NOT protected by Firebase ID token verification as it's called by the payment gateway.
 */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

const UDDOKTAPAY_WEBHOOK_SECRET = process.env.UDDOKTAPAY_WEBHOOK_SECRET;

/**
 * POST /api/payment/webhook
 * Handles payment status updates (callbacks) from UddoktaPay.
 * Verifies the webhook, updates transaction status, and user balance.
 * This route is NOT protected by Firebase ID token verification as it's called by the payment gateway.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Removed connectMongo() as it's no longer needed

    // 2. Parse the incoming webhook payload
    const payload = await req.json();
    const {
      status, // Payment status from UddoktaPay (e.g., 'completed', 'failed', 'cancelled')
      transaction_id: gateway_transaction_id, // UddoktaPay's unique transaction ID
      metadata, // Our custom metadata passed during initiation, containing user_uid and our transaction_id
      // Other fields from UddoktaPay webhook payload as per their documentation
    } = payload;

    // 3. Webhook Security Verification (CRITICAL)
    // You MUST implement the actual security verification as per UddoktaPay's documentation.
    // This might involve:
    //   - Checking a signature in a header (e.g., 'X-UddoktaPay-Signature')
    //   - Verifying a secret key sent in a header or as part of the payload
    //   - IP whitelisting (ensuring the request comes from UddoktaPay's servers)
    const providedSecret = req.headers.get('X-UddoktaPay-Secret'); // Example header name
    if (!UDDOKTAPAY_WEBHOOK_SECRET || !providedSecret || providedSecret !== UDDOKTAPAY_WEBHOOK_SECRET) {
      console.warn('[PaymentWebhook] Unauthorized webhook access attempt: Invalid secret.');
      return NextResponse.json({ message: 'Unauthorized: Invalid secret' }, { status: 401 });
    }
    // --- End Webhook Security Verification ---

    // 4. Validate essential payload data
    if (!gateway_transaction_id || !metadata || !metadata.transaction_id || !metadata.user_uid) {
      console.error('[PaymentWebhook] Missing required payload data:', payload);
      return NextResponse.json({ message: 'Bad Request: Missing essential data in payload' }, { status: 400 });
    }

    const ourTransactionId = metadata.transaction_id; // Our internal transaction ID
    const user_uid = metadata.user_uid; // Firebase UID of the user

    // 5. Find our internal transaction record
    const transaction = await prisma.transaction.findUnique({ where: { id: parseInt(ourTransactionId) } });

    if (!transaction) {
      console.error(`[PaymentWebhook] Transaction not found for internal ID: ${ourTransactionId}`);
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    // 6. Handle Idempotency: Prevent processing the same successful transaction multiple times
    if (transaction.status === 'completed') {
      console.log(`[PaymentWebhook] Transaction ${ourTransactionId} already completed. Ignoring duplicate webhook.`);
      return NextResponse.json({ message: 'Transaction already processed' }, { status: 200 });
    }

    // 7. Process based on UddoktaPay's status
    if (status === 'completed' || status === 'success') { // Adjust status strings as per UddoktaPay docs
      // Update our transaction record to completed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          gateway_transaction_id: gateway_transaction_id,
          description: transaction.description + ' (Completed via webhook)',
        },
      });

      // Update user's account balance atomically
      const user = await prisma.user.update({
        where: { uid: user_uid },
        data: {
          accountBalance: {
            increment: transaction.amount,
          },
        },
      });

      if (user) {
        console.log(`[PaymentWebhook] User ${user_uid} balance updated by ${transaction.amount}. New balance: ${user.accountBalance}`);
      } else {
        console.error(`[PaymentWebhook] User not found in PostgreSQL for UID: ${user_uid}. Balance not updated.`);
      }

      return NextResponse.json({ message: 'Webhook processed successfully: Payment completed' }, { status: 200 });
    } else if (status === 'failed' || status === 'cancelled' || status === 'expired') { // Adjust status strings as per UddoktaPay docs
      // Update our transaction record to failed/cancelled
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: status,
          gateway_transaction_id: gateway_transaction_id,
          description: transaction.description + ` (Status: ${status} via webhook)`,
        },
      });
      console.log(`[PaymentWebhook] Transaction ${ourTransactionId} marked as ${status}.`);
      return NextResponse.json({ message: `Webhook processed successfully: Payment ${status}` }, { status: 200 });
    } else {
      // Handle any other unrecognised status from UddoktaPay
      console.warn(`[PaymentWebhook] Unhandled status: ${status} for transaction ${ourTransactionId}. Payload:`, payload);
      return NextResponse.json({ message: 'Unhandled payment status' }, { status: 200 });
    }
  } catch (error) {
    console.error('[PaymentWebhook] Error processing UddoktaPay webhook:', error);
    return NextResponse.json({ message: 'Internal server error while processing webhook' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}