import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

interface PaymentPayload {
  userId: string;
  amount: number;
  currency: string;
  service: string;
  recipient?: string;
  account?: string;
  timestamp: number;
  nonce: string;
}

interface SubmitPaymentBody {
  userId: string;
  payload: PaymentPayload;
  signature?: string;
  signatureKeyId?: string;
  paymentMethodId: string;
}

const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Verify Firebase ID token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Parse request body
    const body: SubmitPaymentBody = JSON.parse(event.body || '{}');
    const { userId, payload, signature, signatureKeyId, paymentMethodId } = body;

    // Verify user matches token
    if (userId !== decodedToken.uid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden' }),
      };
    }

    // Validate payload
    if (!payload.amount || !payload.service || !paymentMethodId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Check for replay attack (nonce should be unique and timestamp recent)
    const now = Date.now();
    const timestampDiff = now - payload.timestamp;
    
    if (timestampDiff > 5 * 60 * 1000) { // 5 minutes
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request expired' }),
      };
    }

    // Check if nonce has been used before
    const nonceRef = db.collection('nonces').doc(payload.nonce);
    const nonceDoc = await nonceRef.get();
    
    if (nonceDoc.exists) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Duplicate request' }),
      };
    }

    // Store nonce to prevent replay
    await nonceRef.set({
      used: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId,
    });

    // Get payment method
    const paymentMethodRef = db
      .collection('users')
      .doc(userId)
      .collection('paymentMethods')
      .doc(paymentMethodId);
    
    const paymentMethodDoc = await paymentMethodRef.get();
    
    if (!paymentMethodDoc.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Payment method not found' }),
      };
    }

    const paymentMethod = paymentMethodDoc.data();

    // Execute payment using mock adapter
    const mockResponse = await executeMockPayment(payload, paymentMethod!);

    // Create transaction record
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionRef = db
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .doc(transactionId);

    const transactionData = {
      id: transactionId,
      amount: payload.amount,
      currency: payload.currency || 'USD',
      service: payload.service,
      recipient: payload.recipient,
      account: payload.account,
      status: mockResponse.status,
      paymentMethod: paymentMethodId,
      providerResponse: mockResponse,
      confirmedBy: signatureKeyId || 'manual',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await transactionRef.set(transactionData);

    // Add notification
    const notificationRef = db
      .collection('notifications')
      .doc(userId)
      .collection('messages')
      .doc();

    await notificationRef.set({
      title: mockResponse.status === 'SUCCESS' ? 'Payment Successful' : 'Payment Failed',
      body: `${payload.service} payment of $${payload.amount} ${mockResponse.status.toLowerCase()}`,
      type: 'payment',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      transactionId,
    });

    // Log for audit
    await db.collection('admin').doc('logs').collection('payments').add({
      userId,
      transactionId,
      action: 'submit_payment',
      status: mockResponse.status,
      amount: payload.amount,
      service: payload.service,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'],
      userAgent: event.headers['user-agent'],
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        transactionId,
        status: mockResponse.status,
        message: mockResponse.message,
        providerResponse: mockResponse,
      }),
    };

  } catch (error) {
    console.error('Payment submission error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Payment processing failed',
      }),
    };
  }
};

// Mock payment execution
async function executeMockPayment(payload: PaymentPayload, paymentMethod: any) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isMockMode = process.env.MOCK_MODE !== 'false';
  
  if (!isMockMode) {
    // In production, this would call real payment adapters
    throw new Error('Live payment processing not implemented');
  }

  // Mock response generation
  const providerTxnId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate different scenarios
  const random = Math.random();
  
  if (payload.amount > 1000) {
    return {
      status: 'FAILED' as const,
      providerTxnId,
      message: 'Amount exceeds daily limit',
      code: 'LIMIT_EXCEEDED',
    };
  }
  
  if (random < 0.05) { // 5% random failure
    return {
      status: 'FAILED' as const,
      providerTxnId,
      message: 'Insufficient funds',
      code: 'INSUFFICIENT_FUNDS',
    };
  }

  // Success case
  return {
    status: 'SUCCESS' as const,
    providerTxnId,
    message: `Payment successful via ${paymentMethod.provider}`,
    settlementTime: new Date(Date.now() + 3600000).toISOString(),
    fee: Math.max(payload.amount * 0.01, 0.10),
    meta: {
      provider: paymentMethod.provider,
      reference: `REF-${providerTxnId}`,
    },
  };
}

export { handler };