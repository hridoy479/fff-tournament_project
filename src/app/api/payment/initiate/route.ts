import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/authMiddleware'; // Our custom authentication middleware
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import axios from 'axios'; // For making HTTP requests to UddoktaPay

const prisma = new PrismaClient(); // Initialize PrismaClient

const UDDOKTAPAY_API_KEY = process.env.UDDOKTAPAY_API_KEY;
const UDDOKTAPAY_BASE_URL = process.env.UDDOKTAPAY_BASE_URL;
const UDDOKTAPAY_CALLBACK_URL = process.env.UDDOKTAPAY_CALLBACK_URL;

/**
 * POST /api/payment/initiate
 * Initiates a payment process with UddoktaPay.
 * Creates a pending transaction record and returns a payment URL for redirection.
 * This route is protected by Firebase ID token verification.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate the request using the Firebase ID token
  const authResult = await authenticateToken(req);

  // If authentication fails, return the error response from the middleware
  if (!('success' in authResult && authResult.success)) {
    return authResult as NextResponse;
  }

  // Extract Firebase UID from the decoded token
  const { decodedToken } = authResult;
  const firebaseUid = decodedToken.uid;

  let newTransaction: any; // Declare newTransaction here to be accessible in catch block

  try {
    // 2. Removed connectMongo() as it's no longer needed

    // 3. Parse the request body
    const { amount } = await req.json();

    // 4. Basic input validation
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount provided' }, { status: 400 });
    }

    // 5. Find the user in PostgreSQL
    const user = await prisma.user.findUnique({ where: { uid: firebaseUid } });

    if (!user) {
      console.error(`[PaymentInitiate] User not found in PostgreSQL for Firebase UID: ${firebaseUid}`);
      return NextResponse.json({ message: 'User profile not found in database' }, { status: 404 });
    }

    // 6. Validate environment variables for UddoktaPay
    if (!UDDOKTAPAY_API_KEY || !UDDOKTAPAY_BASE_URL || !UDDOKTAPAY_CALLBACK_URL) {
      console.error('[PaymentInitiate] UddoktaPay environment variables are not set.');
      return NextResponse.json({ message: 'Payment gateway configuration error' }, { status: 500 });
    }

    // 7. Create a pending transaction record in our database
    newTransaction = await prisma.transaction.create({
      data: {
        user_uid: firebaseUid,
        amount: amount,
        type: 'deposit',
        status: 'pending',
        description: `Deposit initiation for ${amount} BDT`,
      },
    });

    // 8. Prepare payload for UddoktaPay's Create Charge API
    // IMPORTANT: Replace with actual UddoktaPay API request format from their documentation.
    const uddoktaPayPayload = {
      amount: amount,
      currency: 'BDT', // Assuming BDT, adjust as per your needs
      metadata: {
        user_uid: firebaseUid,
        transaction_id: newTransaction.id.toString(), // Our internal transaction ID (Prisma uses 'id')
      },
      return_url: `${UDDOKTAPAY_CALLBACK_URL}?transaction_id=${newTransaction.id.toString()}&status=success`,
      cancel_url: `${UDDOKTAPAY_CALLBACK_URL}?transaction_id=${newTransaction.id.toString()}&status=cancelled`,
      // Add other required parameters as per UddoktaPay documentation
      // e.g., customer_name, customer_email, customer_phone, etc.
      // You might get these from the user model or frontend input
      customer_name: user.email || 'Guest', // Example
      customer_email: user.email || 'guest@example.com', // Example
      customer_phone: '01XXXXXXXXX', // Example: You might need to collect this from user
    };

    // 9. Make the API call to UddoktaPay
    const uddoktaPayResponse = await axios.post(
      `${UDDOKTAPAY_BASE_URL}/create-charge`, // Adjust endpoint as per docs
      uddoktaPayPayload,
      {
        headers: {
          'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY, // Adjust header name as per docs
          'Content-Type': 'application/json',
        },
      }
    );

    // 10. Extract the payment URL from UddoktaPay's response
    const paymentUrl = uddoktaPayResponse.data.payment_url; // Adjust based on actual response structure

    if (!paymentUrl) {
      console.error('[PaymentInitiate] UddoktaPay did not return a payment URL:', uddoktaPayResponse.data);
      // If payment URL is not returned, mark our transaction as failed
      await prisma.transaction.update({
        where: { id: newTransaction.id },
        data: { status: 'failed', description: 'UddoktaPay did not return payment URL' },
      });
      return NextResponse.json({ message: 'Failed to get payment URL from gateway' }, { status: 500 });
    }

    // 11. Return the payment URL to the frontend
    return NextResponse.json({ paymentUrl: paymentUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error('[PaymentInitiate] Error initiating UddoktaPay payment:', error);
    // Attempt to update the transaction status to failed if it was created
    if (newTransaction && newTransaction.id) {
      await prisma.transaction.update({
        where: { id: newTransaction.id },
        data: { status: 'failed', description: 'Payment initiation failed' },
      });
    }
    return NextResponse.json(
      { message: 'Failed to initiate payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}