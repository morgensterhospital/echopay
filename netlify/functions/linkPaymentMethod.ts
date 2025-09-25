import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
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

interface LinkPaymentMethodBody {
  provider: 'ecocash' | 'card' | 'wallet';
  authData: {
    phone?: string;
    email?: string;
    pin?: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
  };
}

const handler: Handler = async (event, context) => {
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
    const userId = decodedToken.uid;

    // Parse request body
    const body: LinkPaymentMethodBody = JSON.parse(event.body || '{}');
    const { provider, authData } = body;

    if (!provider || !authData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Simulate provider authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock payment method creation
    const tokenId = `TOKEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const paymentMethodId = `pm-${Date.now()}`;
    
    const displayName = getProviderDisplayName(provider, authData);
    const last4 = generateMockLast4(provider, authData);

    // Create payment method document
    const paymentMethodRef = db
      .collection('users')
      .doc(userId)
      .collection('paymentMethods')
      .doc(paymentMethodId);

    const paymentMethodData = {
      id: paymentMethodId,
      provider,
      displayName,
      last4,
      tokenId,
      verified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      providerMeta: {
        account: authData.phone || authData.email || 'N/A',
        limits: {
          daily: 500.00,
          monthly: 5000.00,
        },
        linkedAt: new Date().toISOString(),
      },
    };

    await paymentMethodRef.set(paymentMethodData);

    // Add notification
    const notificationRef = db
      .collection('notifications')
      .doc(userId)
      .collection('messages')
      .doc();

    await notificationRef.set({
      title: 'Payment Method Added',
      body: `${displayName} has been linked successfully`,
      type: 'system',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      meta: { paymentMethodId },
    });

    // Audit log
    await db.collection('admin').doc('logs').collection('payment_methods').add({
      userId,
      paymentMethodId,
      action: 'link_payment_method',
      provider,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'],
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentMethod: {
          id: paymentMethodId,
          provider,
          displayName,
          last4,
          verified: true,
        },
      }),
    };

  } catch (error) {
    console.error('Link payment method error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Failed to link payment method',
      }),
    };
  }
};

function getProviderDisplayName(provider: string, authData: any): string {
  switch (provider) {
    case 'ecocash':
      return `EcoCash${authData.phone ? ` (***${authData.phone.slice(-4)})` : ''}`;
    case 'card':
      return `Card${authData.cardNumber ? ` ****${authData.cardNumber.slice(-4)}` : ''}`;
    case 'wallet':
      return 'EchoPay Wallet';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}

function generateMockLast4(provider: string, authData: any): string {
  switch (provider) {
    case 'ecocash':
      return authData.phone ? `***${authData.phone.slice(-4)}` : `***${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    case 'card':
      return authData.cardNumber ? authData.cardNumber.slice(-4) : Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    case 'wallet':
      return '';
    default:
      return '';
  }
}

export { handler };