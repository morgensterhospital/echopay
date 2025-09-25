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

interface AIQueryBody {
  userId: string;
  text: string;
  sessionId: string;
  context?: {
    balance?: number;
    recentTransactions?: any[];
  };
}

interface AIIntent {
  intent: string;
  amount?: number;
  currency?: string;
  service?: string;
  recipient?: string;
  account?: string;
  paymentMethod?: string;
  schedule?: string;
  confirmSuggested?: boolean;
  confidence?: number;
}

interface AIResponse {
  message: string;
  intent?: AIIntent;
  suggestions?: string[];
  requiresConfirmation?: boolean;
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
    const body: AIQueryBody = JSON.parse(event.body || '{}');
    const { text, sessionId, context } = body;

    if (!text || !sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Process AI query
    const aiResponse = await processAIQuery(text, userId, context);

    // Save conversation to Firestore
    const conversationRef = db
      .collection('users')
      .doc(userId)
      .collection('assistantSessions')
      .doc(sessionId)
      .collection('messages');

    // Save user message
    await conversationRef.add({
      role: 'user',
      content: text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Save assistant response
    await conversationRef.add({
      role: 'assistant',
      content: aiResponse.message,
      intent: aiResponse.intent || null,
      suggestions: aiResponse.suggestions || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update session metadata
    await db
      .collection('users')
      .doc(userId)
      .collection('assistantSessions')
      .doc(sessionId)
      .set({
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        messageCount: admin.firestore.FieldValue.increment(2),
      }, { merge: true });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(aiResponse),
    };

  } catch (error) {
    console.error('AI query error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'AI processing failed',
      }),
    };
  }
};

async function processAIQuery(text: string, userId: string, context?: any): Promise<AIResponse> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const isMockMode = !geminiApiKey || process.env.MOCK_MODE !== 'false';

  if (isMockMode) {
    return getMockAIResponse(text);
  }

  try {
    const systemPrompt = `You are EchoPay AI assistant. Parse user payment intents and respond helpfully.

Available services: ZESA (electricity), AIRTIME (mobile credit), DATA (mobile data), SEND (person-to-person transfer)
Available payment methods: ecocash, card, wallet

Parse requests into JSON with these fields:
- intent: PAY_BILL, TOPUP_AIRTIME, BUY_DATA, SEND_MONEY, SHOW_TRANSACTIONS, SHOW_BALANCE, SCHEDULE_PAYMENT
- amount: number
- currency: USD (default)
- service: ZESA|AIRTIME|DATA|SEND
- recipient: person name or phone
- account: account number for bills
- paymentMethod: ecocash|card|wallet (default: wallet)
- confirmSuggested: true if payment action

Always respond with both human message and structured data.
Keep responses concise. If unclear, ask ONE clarifying question.

${context?.balance ? `User's wallet balance: $${context.balance}` : ''}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt + '\n\nUser: ' + text }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();
    return parseGeminiResponse(data);

  } catch (error) {
    console.error('Gemini API error:', error);
    return getMockAIResponse(text);
  }
}

function getMockAIResponse(text: string): AIResponse {
  const lowerText = text.toLowerCase();
  
  // Payment intents
  if (lowerText.includes('pay') && lowerText.includes('zesa')) {
    const amountMatch = lowerText.match(/\$?(\d+(?:\.\d{2})?)/);
    const accountMatch = lowerText.match(/(\d{7,10})/);
    
    return {
      message: `I'll help you pay ZESA ${amountMatch ? `$${amountMatch[1]}` : ''} ${accountMatch ? `to account ${accountMatch[1]}` : ''}. Tap Confirm to proceed with biometric authentication.`,
      intent: {
        intent: 'PAY_BILL',
        amount: amountMatch ? parseFloat(amountMatch[1]) : undefined,
        currency: 'USD',
        service: 'ZESA',
        account: accountMatch ? accountMatch[1] : undefined,
        paymentMethod: 'wallet',
        confirmSuggested: true,
      },
      requiresConfirmation: true,
      suggestions: ['Confirm payment', 'Change amount', 'Schedule recurring'],
    };
  }

  if (lowerText.includes('airtime') || lowerText.includes('top up')) {
    const amountMatch = lowerText.match(/\$?(\d+(?:\.\d{2})?)/);
    const phoneMatch = lowerText.match(/(\+?263\d{9}|\d{10})/);
    
    return {
      message: `I'll top up ${amountMatch ? `$${amountMatch[1]}` : '$5'} airtime ${phoneMatch ? `for ${phoneMatch[1]}` : ''}. Ready to confirm?`,
      intent: {
        intent: 'TOPUP_AIRTIME',
        amount: amountMatch ? parseFloat(amountMatch[1]) : 5,
        currency: 'USD',
        service: 'AIRTIME',
        recipient: phoneMatch ? phoneMatch[1] : undefined,
        paymentMethod: 'wallet',
        confirmSuggested: true,
      },
      requiresConfirmation: true,
      suggestions: ['Confirm top-up', 'Change amount', 'Save contact'],
    };
  }

  if (lowerText.includes('send') && (lowerText.includes('money') || lowerText.includes('$'))) {
    const amountMatch = lowerText.match(/\$?(\d+(?:\.\d{2})?)/);
    const phoneMatch = lowerText.match(/(\+?263\d{9}|\d{10})/);
    
    return {
      message: `I'll send ${amountMatch ? `$${amountMatch[1]}` : '$10'} ${phoneMatch ? `to ${phoneMatch[1]}` : 'to your contact'}. Confirm with your fingerprint?`,
      intent: {
        intent: 'SEND_MONEY',
        amount: amountMatch ? parseFloat(amountMatch[1]) : 10,
        currency: 'USD',
        service: 'SEND',
        recipient: phoneMatch ? phoneMatch[1] : undefined,
        paymentMethod: 'wallet',
        confirmSuggested: true,
      },
      requiresConfirmation: true,
      suggestions: ['Confirm transfer', 'Change amount', 'Add message'],
    };
  }

  if (lowerText.includes('balance') || lowerText.includes('how much')) {
    return {
      message: 'Your EchoPay wallet balance is $1,000.00. Would you like to see recent transactions?',
      intent: { intent: 'SHOW_BALANCE' },
      suggestions: ['Show transactions', 'Add money', 'Pay bill'],
    };
  }

  if (lowerText.includes('transaction') || lowerText.includes('history')) {
    return {
      message: 'Here are your recent transactions. You can tap any transaction for details or to repeat it.',
      intent: { intent: 'SHOW_TRANSACTIONS' },
      suggestions: ['Filter by date', 'Export transactions', 'Repeat payment'],
    };
  }

  // Default response
  return {
    message: 'I can help you with payments, airtime top-ups, money transfers, and checking your balance. What would you like to do?',
    suggestions: ['Pay ZESA bill', 'Buy airtime', 'Send money', 'Check balance'],
  };
}

function parseGeminiResponse(data: any): AIResponse {
  try {
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let intent: AIIntent | undefined;
    
    if (jsonMatch) {
      try {
        intent = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Continue without intent if JSON parsing fails
      }
    }

    // Extract human message
    let message = content;
    if (jsonMatch) {
      message = content.replace(jsonMatch[0], '').trim();
      message = message.replace(/^(Response:|Assistant:)/i, '').trim();
    }

    return {
      message: message || 'I can help you with payments. What would you like to do?',
      intent,
      requiresConfirmation: intent?.confirmSuggested || false,
      suggestions: getSuggestionsForIntent(intent),
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return getMockAIResponse('help'); // Fallback to mock response
  }
}

function getSuggestionsForIntent(intent?: AIIntent): string[] {
  if (!intent) {
    return ['Pay bill', 'Buy airtime', 'Send money', 'Check balance'];
  }

  switch (intent.intent) {
    case 'PAY_BILL':
      return ['Confirm payment', 'Change amount', 'Schedule recurring'];
    case 'TOPUP_AIRTIME':
      return ['Confirm top-up', 'Change amount', 'Save contact'];
    case 'SEND_MONEY':
      return ['Confirm transfer', 'Change amount', 'Add message'];
    case 'SHOW_BALANCE':
      return ['Add money', 'Show transactions', 'Set budget'];
    default:
      return ['Try again', 'Go to dashboard', 'Get help'];
  }
}

export { handler };