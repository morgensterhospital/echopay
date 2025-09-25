import { PaymentAdapter, PaymentPayload, PaymentMethod, ProviderResponse } from './types';

export class MockAdapter implements PaymentAdapter {
  private static readonly MOCK_DELAY = 2000; // 2 seconds to simulate network

  async executePayment(payload: PaymentPayload, paymentMethod: PaymentMethod): Promise<ProviderResponse> {
    // Simulate network delay
    await this.delay(MockAdapter.MOCK_DELAY);

    // Generate mock transaction ID
    const providerTxnId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Determine success/failure based on amount for testing
    const shouldFail = this.shouldSimulateFailure(payload);

    if (shouldFail.fail) {
      return {
        status: 'FAILED',
        providerTxnId,
        message: shouldFail.message,
        code: shouldFail.code,
      };
    }

    // Calculate mock fee (1% of amount, min $0.10)
    const fee = Math.max(payload.amount * 0.01, 0.10);

    return {
      status: 'SUCCESS',
      providerTxnId,
      message: `Payment successful via ${paymentMethod.provider}`,
      settlementTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour settlement
      fee,
      meta: {
        provider: paymentMethod.provider,
        reference: `REF-${providerTxnId}`,
        exchangeRate: payload.currency === 'USD' ? 1 : 0.067, // Mock ZWL rate
      },
    };
  }

  async linkPaymentMethod(authData: { provider: string; phone?: string; email?: string }): Promise<PaymentMethod> {
    await this.delay(1500);

    const tokenId = `TOKEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const last4 = this.generateMockLast4(authData.provider);

    return {
      id: `pm-${Date.now()}`,
      provider: authData.provider,
      tokenId,
      displayName: this.getProviderDisplayName(authData.provider, authData),
      last4,
      providerMeta: {
        verified: true,
        linkedAt: new Date().toISOString(),
        account: authData.phone || authData.email,
        limits: {
          daily: 500.00,
          monthly: 5000.00,
        },
      },
    };
  }

  async revokePaymentMethod(tokenId: string): Promise<boolean> {
    await this.delay(1000);
    
    // Always succeed for mock
    console.log(`Mock: Revoked payment method with token ${tokenId}`);
    return true;
  }

  async getBalance(paymentMethod: PaymentMethod): Promise<number> {
    await this.delay(800);
    
    // Return mock balance based on provider
    switch (paymentMethod.provider) {
      case 'ecocash':
        return 150.75 + Math.random() * 100;
      case 'wallet':
        return 1000.00;
      case 'card':
        return 999999.99; // Credit card - no balance limit
      default:
        return 0;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldSimulateFailure(payload: PaymentPayload): { fail: boolean; message: string; code: string } {
    // Simulate different failure scenarios for testing
    const url = new URL(window.location.href);
    const mockFail = url.searchParams.get('mockFail');

    if (mockFail === 'insufficient') {
      return {
        fail: true,
        message: 'Insufficient funds in account',
        code: 'INSUFFICIENT_FUNDS',
      };
    }

    if (mockFail === 'network') {
      return {
        fail: true,
        message: 'Network error - please try again',
        code: 'NETWORK_ERROR',
      };
    }

    if (mockFail === 'declined') {
      return {
        fail: true,
        message: 'Payment declined by provider',
        code: 'PAYMENT_DECLINED',
      };
    }

    // Random 5% failure rate for realistic testing
    if (Math.random() < 0.05) {
      return {
        fail: true,
        message: 'Temporary service unavailable',
        code: 'SERVICE_UNAVAILABLE',
      };
    }

    // Amount-based failure simulation
    if (payload.amount > 1000) {
      return {
        fail: true,
        message: 'Amount exceeds daily limit',
        code: 'LIMIT_EXCEEDED',
      };
    }

    return { fail: false, message: '', code: '' };
  }

  private generateMockLast4(provider: string): string {
    switch (provider) {
      case 'ecocash':
        return `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      case 'card':
        return `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      default:
        return '';
    }
  }

  private getProviderDisplayName(provider: string, authData: any): string {
    switch (provider) {
      case 'ecocash':
        return `EcoCash ${authData.phone ? `(${authData.phone.substr(-4)})` : ''}`;
      case 'card':
        return `Card ${authData.last4 ? `****${authData.last4}` : ''}`;
      case 'wallet':
        return 'EchoPay Wallet';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  }
}

export const mockAdapter = new MockAdapter();