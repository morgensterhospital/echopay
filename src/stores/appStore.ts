import { create } from 'zustand';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PaymentMethod {
  id: string;
  provider: 'ecocash' | 'card' | 'wallet';
  displayName: string;
  last4?: string;
  tokenId: string;
  verified: boolean;
  createdAt: Date;
  providerMeta: Record<string, any>;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  service: 'ZESA' | 'AIRTIME' | 'DATA' | 'SEND';
  recipient?: string;
  account?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paymentMethod: string;
  createdAt: Date;
  confirmedBy?: string;
  providerResponse?: any;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'payment' | 'system' | 'security';
  read: boolean;
  createdAt: Date;
  meta?: Record<string, any>;
}

export interface AppState {
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  notifications: Notification[];
  balance: number;
  loading: boolean;
  
  // Actions
  loadPaymentMethods: (userId: string) => Promise<void>;
  loadTransactions: (userId: string) => Promise<void>;
  loadNotifications: (userId: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  updateBalance: (amount: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  paymentMethods: [],
  transactions: [],
  notifications: [],
  balance: 1000.00, // Mock initial balance
  loading: false,

  loadPaymentMethods: async (userId: string) => {
    try {
      set({ loading: true });
      const methodsRef = collection(db, 'users', userId, 'paymentMethods');
      const snapshot = await getDocs(methodsRef);
      
      const methods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as PaymentMethod));
      
      set({ paymentMethods: methods });
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      set({ loading: false });
    }
  },

  loadTransactions: async (userId: string) => {
    try {
      set({ loading: true });
      const txnRef = collection(db, 'users', userId, 'transactions');
      const q = query(txnRef, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Transaction));
      
      set({ transactions });
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      set({ loading: false });
    }
  },

  loadNotifications: async (userId: string) => {
    // Mock notifications for now
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Payment Successful',
        body: 'ZESA payment of $20.00 completed successfully',
        type: 'payment',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'New Payment Method',
        body: 'EcoCash account linked successfully',
        type: 'system',
        read: true,
        createdAt: new Date(Date.now() - 86400000),
      }
    ];
    
    set({ notifications: mockNotifications });
  },

  addTransaction: (transaction: Transaction) => {
    set(state => ({
      transactions: [transaction, ...state.transactions]
    }));
  },

  updateBalance: (amount: number) => {
    set(state => ({
      balance: state.balance + amount
    }));
  }
}));