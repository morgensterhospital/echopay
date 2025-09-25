import { create, get, supported } from '@github/webauthn-json';

export interface WebAuthnCredential {
  id: string;
  publicKey: string;
  transports: string[];
  createdAt: Date;
  deviceName: string;
}

export class WebAuthnService {
  static async isSupported(): Promise<boolean> {
    return supported();
  }

  static async register(userId: string, displayName: string): Promise<WebAuthnCredential> {
    if (!await this.isSupported()) {
      throw new Error('WebAuthn not supported');
    }

    const challenge = await this.getRegistrationChallenge(userId);
    
    const credential = await create({
      publicKey: {
        challenge,
        rp: {
          name: 'EchoPay',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: displayName,
          displayName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'direct',
      },
    });

    // Register the credential with the backend
    const response = await fetch('/.netlify/functions/registerWebAuthnPublicKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getIdToken()}`,
      },
      body: JSON.stringify({
        userId,
        credentialId: credential.id,
        publicKey: credential.response.publicKey,
        transports: credential.response.transports || [],
        deviceName: await this.getDeviceName(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register WebAuthn credential');
    }

    return {
      id: credential.id,
      publicKey: credential.response.publicKey,
      transports: credential.response.transports || [],
      createdAt: new Date(),
      deviceName: await this.getDeviceName(),
    };
  }

  static async authenticate(challengeData: any): Promise<any> {
    if (!await this.isSupported()) {
      throw new Error('WebAuthn not supported');
    }

    const credential = await get({
      publicKey: challengeData,
    });

    return credential;
  }

  static async signPayload(payload: any, credentialId: string): Promise<string> {
    if (!await this.isSupported()) {
      throw new Error('WebAuthn not supported');
    }

    const challenge = new TextEncoder().encode(JSON.stringify(payload));
    const challengeB64 = btoa(String.fromCharCode(...challenge));

    const credential = await get({
      publicKey: {
        challenge: challengeB64,
        allowCredentials: [{
          id: credentialId,
          type: 'public-key',
          transports: ['internal', 'hybrid'],
        }],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    return credential.response.signature;
  }

  private static async getRegistrationChallenge(userId: string): Promise<string> {
    const response = await fetch('/.netlify/functions/webauthn/challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getIdToken()}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    return data.challenge;
  }

  private static async getIdToken(): Promise<string> {
    // This would get the Firebase ID token
    const auth = await import('../lib/firebase').then(m => m.auth);
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken();
  }

  private static async getDeviceName(): Promise<string> {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    return 'Unknown Device';
  }
}