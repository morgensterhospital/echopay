export interface PaymentPayload {
  userId: string;
  amount: number;
  currency: string;
  service: string;
  recipient?: string;
  account?: string;
  timestamp: number;
  nonce: string;
}

export interface PaymentMethod {
  id: string;
  provider: string;
  tokenId: string;
  displayName: string;
  last4?: string;
  providerMeta: Record<string, any>;
}

export interface ProviderResponse {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  providerTxnId?: string;
  message: string;
  code?: string;
  settlementTime?: string;
  fee?: number;
  meta?: Record<string, any>;
}

export interface PaymentAdapter {
  executePayment(payload: PaymentPayload, paymentMethod: PaymentMethod): Promise<ProviderResponse>;
  linkPaymentMethod(authData: any): Promise<PaymentMethod>;
  revokePaymentMethod(tokenId: string): Promise<boolean>;
  getBalance?(paymentMethod: PaymentMethod): Promise<number>;
}