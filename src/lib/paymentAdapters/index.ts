import { PaymentAdapter } from './types';
import { mockAdapter } from './mockAdapter';

// Adapter registry
const adapters: Record<string, PaymentAdapter> = {
  mock: mockAdapter,
  ecocash: mockAdapter, // Use mock for now
  card: mockAdapter, // Use mock for now
  wallet: mockAdapter, // Use mock for now
};

export function getAdapter(provider: string): PaymentAdapter {
  const adapter = adapters[provider] || adapters.mock;
  return adapter;
}

export * from './types';
export { mockAdapter };