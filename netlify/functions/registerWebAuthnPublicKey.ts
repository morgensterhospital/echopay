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

interface RegisterWebAuthnBody {
  userId: string;
  credentialId: string;
  publicKey: string;
  transports: string[];
  deviceName: string;
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
    const tokenUserId = decodedToken.uid;

    // Parse request body
    const body: RegisterWebAuthnBody = JSON.parse(event.body || '{}');
    const { userId, credentialId, publicKey, transports, deviceName } = body;

    // Verify user matches token
    if (userId !== tokenUserId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden' }),
      };
    }

    if (!credentialId || !publicKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Store WebAuthn credential
    const credentialRef = db
      .collection('users')
      .doc(userId)
      .collection('webauthn')
      .doc(credentialId);

    const credentialData = {
      id: credentialId,
      publicKey,
      transports: transports || [],
      deviceName: deviceName || 'Unknown Device',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsed: null,
      active: true,
    };

    await credentialRef.set(credentialData);

    // Update user settings to indicate biometric is enabled
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      settings: {
        biometricEnabled: true,
        biometricSetupAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    }, { merge: true });

    // Add notification
    const notificationRef = db
      .collection('notifications')
      .doc(userId)
      .collection('messages')
      .doc();

    await notificationRef.set({
      title: 'Biometric Security Enabled',
      body: `Biometric authentication has been set up on ${deviceName}`,
      type: 'security',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      meta: { credentialId, deviceName },
    });

    // Audit log
    await db.collection('admin').doc('logs').collection('webauthn').add({
      userId,
      credentialId,
      action: 'register_credential',
      deviceName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'],
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'WebAuthn credential registered successfully',
        credentialId,
      }),
    };

  } catch (error) {
    console.error('WebAuthn registration error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Failed to register WebAuthn credential',
      }),
    };
  }
};

export { handler };