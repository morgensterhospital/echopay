import { create } from 'zustand';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: Timestamp;
  language: string;
  timezone: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await get().signIn(user);
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    });

    // Return unsubscribe function if needed
    return unsubscribe;
  },

  signIn: async (user: User) => {
    try {
      set({ loading: true });
      
      // Get or create user profile
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      let profile: UserProfile;
      
      if (!profileSnap.exists()) {
        // Create new profile
        profile = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          phone: user.phoneNumber || '',
          createdAt: Timestamp.now(),
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        await setDoc(profileRef, profile);
      } else {
        profile = profileSnap.data() as UserProfile;
      }
      
      set({ 
        user, 
        profile, 
        loading: false, 
        initialized: true 
      });
    } catch (error) {
      console.error('Error signing in:', error);
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      set({ user: null, profile: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    try {
      const updatedProfile = { ...profile, ...updates };
      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, updatedProfile, { merge: true });
      set({ profile: updatedProfile });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }
}));