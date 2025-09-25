export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIIntent {
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

export interface AIResponse {
  message: string;
  intent?: AIIntent;
  suggestions?: string[];
  requiresConfirmation?: boolean;
}

export class GeminiClient {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async query(
    message: string, 
    sessionId: string, 
    context?: { balance?: number; recentTransactions?: any[] }
  ): Promise<AIResponse> {
    // If no API key, use mock responses
    if (!this.apiKey || import.meta.env.VITE_MOCK_MODE === 'true') {
      return this.getMockResponse(message);
    }

    try {
      const systemPrompt = this.getSystemPrompt(context);
      const userPrompt = this.formatUserPrompt(message, context);

      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt + '\n\nUser: ' + userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      });

      const data = await response.json();
      return this.parseGeminiResponse(data);
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        message: "I'm having trouble connecting right now. Please try again later.",
        suggestions: ['Try again', 'Use manual payment form'],
      };
    }
  }

  private getSystemPrompt(context?: any): string {
    return `You are EchoPay AI assistant. Your job is to parse user input into structured payment intents and provide clear, helpful responses.

Available services: ZESA (electricity), AIRTIME (mobile credit), DATA (mobile data), SEND (person-to-person transfer)
Available payment methods: ecocash, card, wallet

Parse user requests into JSON format with these fields:
- intent: PAY_BILL, TOPUP_AIRTIME, BUY_DATA, SEND_MONEY, SHOW_TRANSACTIONS, SHOW_BALANCE, SCHEDULE_PAYMENT
- amount: number
- currency: USD (default)
- service: ZESA|AIRTIME|DATA|SEND
- recipient: person name or phone
- account: account number for bills
- paymentMethod: ecocash|card|wallet (default: wallet)
- confirmSuggested: true if payment action

Always respond with both a human message and structured data (if applicable).
Keep responses concise and clear.
If user intent is unclear, ask ONE clarifying question.

${context?.balance ? `User's wallet balance: $${context.balance}` : ''}
${context?.recentTransactions ? `Recent transactions: ${JSON.stringify(context.recentTransactions.slice(0, 3))}` : ''}`;
  }

  private formatUserPrompt(message: string, context?: any): string {
    return message;
  }

  private parseGeminiResponse(data: any): AIResponse {
    try {
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      let intent: AIIntent | undefined;
      
      if (jsonMatch) {
        try {
          intent = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Couldn't parse JSON, continue without intent
        }
      }

      // Extract the human message (text before or after JSON)
      let message = content;
      if (jsonMatch) {
        message = content.replace(jsonMatch[0], '').trim();
        // Remove common prefixes/suffixes
        message = message.replace(/^(Response:|Assistant:)/i, '').trim();
      }

      return {
        message: message || 'I can help you with payments. What would you like to do?',
        intent,
        requiresConfirmation: intent?.confirmSuggested || false,
        suggestions: this.getSuggestions(intent),
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        message: "I didn't quite understand that. Could you try rephrasing?",
        suggestions: ['Pay bill', 'Buy airtime', 'Send money', 'Show balance'],
      };
    }
  }

  private getMockResponse(message: string): AIResponse {
    const lowerMessage = message.toLowerCase();
    
    // Payment intents
    if (lowerMessage.includes('pay') && lowerMessage.includes('zesa')) {
      const amountMatch = lowerMessage.match(/\$?(\d+(?:\.\d{2})?)/);
      const accountMatch = lowerMessage.match(/(\d{7,10})/);
      
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
      };
    }

    if (lowerMessage.includes('airtime') || lowerMessage.includes('top up')) {
      const amountMatch = lowerMessage.match(/\$?(\d+(?:\.\d{2})?)/);
      const phoneMatch = lowerMessage.match(/(\+?263\d{9}|\d{10})/);
      
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
      };
    }

    if (lowerMessage.includes('send') && (lowerMessage.includes('money') || lowerMessage.includes('$'))) {
      const amountMatch = lowerMessage.match(/\$?(\d+(?:\.\d{2})?)/);
      const phoneMatch = lowerMessage.match(/(\+?263\d{9}|\d{10})/);
      
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
      };
    }

    if (lowerMessage.includes('balance') || lowerMessage.includes('how much')) {
      return {
        message: 'Your EchoPay wallet balance is $1,000.00. Would you like to see recent transactions?',
        intent: {
          intent: 'SHOW_BALANCE',
        },
        suggestions: ['Show transactions', 'Add money', 'Pay bill'],
      };
    }

    if (lowerMessage.includes('transaction') || lowerMessage.includes('history')) {
      return {
        message: 'Here are your recent transactions. You can tap any transaction for details or to repeat it.',
        intent: {
          intent: 'SHOW_TRANSACTIONS',
        },
        suggestions: ['Filter by date', 'Export transactions', 'Repeat payment'],
      };
    }

    // Default helpful response
    return {
      message: 'I can help you with payments, airtime top-ups, money transfers, and checking your balance. What would you like to do?',
      suggestions: [
        'Pay ZESA bill',
        'Buy airtime',
        'Send money',
        'Check balance',
      ],
    };
  }

  private getSuggestions(intent?: AIIntent): string[] {
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
}

export const geminiClient = new GeminiClient();