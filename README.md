# EchoPay - Voice-Powered Payment Application

EchoPay is a revolutionary payment application that combines AI voice recognition with biometric security for seamless transactions. Built with React, Firebase, and Netlify Functions, it demonstrates the future of voice-powered financial services.

## 🚀 Features

- **Voice Payments**: Natural language payment commands using Gemini AI
- **Biometric Security**: WebAuthn-based fingerprint/face ID authentication
- **Multi-Provider Support**: EcoCash, bank cards, and wallet integration
- **Real-time Transactions**: Live transaction history and notifications
- **AI Assistant**: Intelligent payment suggestions and fraud detection
- **Mobile-First Design**: Optimized for mobile payment workflows

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Firebase SDK** for authentication and database

### Backend
- **Netlify Functions** (serverless)
- **Firebase Admin SDK** for server-side operations
- **Firestore** for document storage
- **Realtime Database** for live notifications

### AI Integration
- **Google Gemini** for natural language understanding
- **Web Speech API** for voice input
- Custom intent parsing and response generation

### Security
- **WebAuthn** for biometric authentication
- **Firebase Authentication** for user management
- **Request signing** with nonce-based replay protection
- **Row-level security** with Firestore rules

## 🛠️ Setup Instructions

### Prerequisites & Required Services

Before setting up EchoPay, you'll need to create accounts and gather credentials from the following services:

#### 1. Node.js & Development Tools
- **Node.js 18+** and npm
- **Git** for version control
- **Netlify CLI** for local development: `npm install -g netlify-cli`
- **Firebase CLI** for deploying security rules: `npm install -g firebase-tools`

#### 2. Firebase Project Setup
You need a Firebase project with multiple services enabled:

**Create Firebase Project:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "echopay-demo")
4. Enable Google Analytics (optional but recommended)
5. Wait for project creation to complete

**Enable Required Services:**
1. **Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
   - Optionally enable "Phone" for SMS verification

2. **Firestore Database:**
   - Go to Firestore Database → Create database
   - Start in "test mode" (we'll deploy security rules later)
   - Choose a location close to your users

3. **Realtime Database:**
   - Go to Realtime Database → Create database
   - Start in "test mode"
   - Choose same region as Firestore

4. **Cloud Messaging (for notifications):**
   - Go to Cloud Messaging
   - No additional setup needed initially

**Get Firebase Configuration:**
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" → Web app (</>) 
4. Register app with nickname (e.g., "echopay-web")
5. Copy the config object - you'll need these values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

**Create Service Account (for server-side access):**
1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values for later:
   - `project_id`
   - `client_email` 
   - `private_key` (the entire key including `-----BEGIN PRIVATE KEY-----`)

#### 3. Google Cloud & Gemini AI Setup

**Create Google Cloud Project:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or use existing one
3. Enable billing (required for Gemini API)

**Enable Gemini API:**
1. Go to APIs & Services → Library
2. Search for "Generative Language API" (Gemini)
3. Click "Enable"

**Create API Key:**
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → API Key
3. Copy the API key
4. (Recommended) Click "Restrict Key":
   - Application restrictions: HTTP referrers
   - Add your domain (e.g., `https://your-app.netlify.app/*`)
   - API restrictions: Select "Generative Language API"

#### 4. Netlify Account Setup

**Create Netlify Account:**
1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub/GitLab/Bitbucket (recommended for easy deployment)
3. Verify your email

**Install Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
```

### 1. Clone and Install
```bash
git clone https://github.com/your-username/echopay.git
cd echopay
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with your gathered credentials:

```env
# Firebase Client Configuration
VITE_FIREBASE_API_KEY=AIza...your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Gemini AI
VITE_GEMINI_API_KEY=AIza...your_gemini_api_key

# Development Settings
MOCK_MODE=true
NODE_ENV=development
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Keep `MOCK_MODE=true` for development (no real payments)
- The `VITE_` prefix makes variables available to the React app
- Never commit the `.env` file to version control

### 3. Netlify Environment Variables

For the serverless functions to work, you need to set additional environment variables in Netlify:

**Option A: Netlify Dashboard (Recommended for production)**
1. Go to your Netlify site dashboard
2. Go to Site settings → Environment variables
3. Add these variables:

```
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...your_full_private_key...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your-project-id
GEMINI_API_KEY=AIza...your_gemini_api_key
MOCK_MODE=true
NODE_ENV=development
```

**Option B: Local Development (.env file)**
Add these to your `.env` file for local testing:

```env
# Add these to your existing .env file
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...your_full_private_key...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**⚠️ Important:** 
- The private key must include `\n` for line breaks
- Wrap the private key in quotes if it contains special characters
- Never expose these credentials in client-side code

### 4. Deploy Firebase Security Rules
```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init
# Select: Firestore, Realtime Database
# Use existing project: select your created project
# Accept default file names

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only database:rules
```

### 5. Local Development

**Start the development servers:**
```bash
# Terminal 1: Start React development server
npm run dev

# Terminal 2: Start Netlify functions locally
netlify dev
```

**Access the application:**
- Main app: `http://localhost:8888` (Netlify dev proxy)
- Direct React app: `http://localhost:5173` (if running npm run dev separately)
- Functions: `http://localhost:8888/.netlify/functions/[function-name]`

### 6. Verify Setup

**Test the installation:**
1. Open `http://localhost:8888`
2. You should see the EchoPay landing page
3. Click "Get Started" to test authentication
4. Try creating an account with email/password
5. Test the voice assistant (click the mic icon)
6. Try a mock payment flow

**Common Issues & Solutions:**

**Firebase Connection Issues:**
- Verify all Firebase config values are correct
- Check that Authentication and Firestore are enabled
- Ensure security rules are deployed

**Netlify Functions Not Working:**
- Make sure `netlify dev` is running
- Check that environment variables are set correctly
- Verify Firebase Admin credentials are valid

**Voice Assistant Not Responding:**
- Check browser console for errors
- Verify Gemini API key is set
- Try with `MOCK_MODE=true` first
- Ensure microphone permissions are granted

**WebAuthn/Biometric Issues:**
- Use HTTPS or localhost (required for WebAuthn)
- Test on a device with biometric capabilities
- Check browser compatibility (Chrome/Edge recommended)

### 7. Production Deployment

**Deploy to Netlify:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy:
   ```bash
   # Or deploy directly
   netlify deploy --prod
   ```

**Production Checklist:**
- [ ] Set `MOCK_MODE=false` for live payments (when ready)
- [ ] Configure custom domain with SSL
- [ ] Set up Firebase project billing
- [ ] Enable Firebase App Check for security
- [ ] Configure CORS settings for your domain
- [ ] Set up monitoring and error tracking
- [ ] Test all payment flows thoroughly

### 8. Optional Enhancements

**Firebase App Check (Recommended for production):**
1. Go to Firebase Console → App Check
2. Register your web app
3. Enable reCAPTCHA v3 provider
4. Add the App Check token to your requests

**Custom Domain Setup:**
1. In Netlify dashboard → Domain settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic with Netlify)

**Monitoring & Analytics:**
- Enable Firebase Analytics
- Set up error tracking (Sentry, LogRocket)
- Configure performance monitoring
- Set up uptime monitoring

## 🔑 Required Credentials Summary

Here's a checklist of all credentials you need to gather:

**Firebase (Required):**
- [ ] Firebase API Key
- [ ] Auth Domain
- [ ] Project ID
- [ ] Storage Bucket
- [ ] Messaging Sender ID
- [ ] App ID
- [ ] Service Account Private Key
- [ ] Service Account Email

**Google Cloud (Required for AI features):**
- [ ] Gemini API Key

**Netlify (Required for deployment):**
- [ ] Netlify account
- [ ] Netlify CLI installed and authenticated

**Optional (for production):**
- [ ] Custom domain
- [ ] SSL certificate (automatic with Netlify)
- [ ] Error tracking service credentials
- [ ] Analytics tracking IDs

## 🔧 Configuration

### Mock vs Live Mode
- **Mock Mode** (`MOCK_MODE=true`): All payments are simulated, no real money involved
- **Live Mode** (`MOCK_MODE=false`): Requires real payment gateway credentials

### Payment Adapter Integration
To add real payment gateways:

1. Create adapter files in `src/lib/paymentAdapters/`:
   ```typescript
   // paynowAdapter.ts
   export class PaynowAdapter implements PaymentAdapter {
     async executePayment(payload, paymentMethod) {
       // Real Paynow API integration
     }
   }
   ```

2. Register in `src/lib/paymentAdapters/index.ts`:
   ```typescript
   import { paynowAdapter } from './paynowAdapter';
   
   const adapters: Record<string, PaymentAdapter> = {
     paynow: paynowAdapter,
     // ... other adapters
   };
   ```

3. Add environment variables for production keys:
   ```env
   PAYNOW_INTEGRATION_ID=your_id
   PAYNOW_INTEGRATION_KEY=your_key
   STRIPE_SECRET_KEY=your_stripe_key
   ```

## 🧪 Testing

### Demo Account
Use these credentials to test the application:
- **Email**: demo@echopay.com
- **Password**: demo123

### Voice Commands to Test
- "Pay ZESA $20 to account 1234567"
- "Top up $5 airtime for +263771234567"
- "Send $10 to John"
- "Show my balance"
- "Show recent transactions"

### Payment Scenarios
- Amounts under $1000: Usually succeed
- Amounts over $1000: Fail with "limit exceeded"
- URL parameter `?mockFail=insufficient`: Simulate insufficient funds
- URL parameter `?mockFail=network`: Simulate network error

### WebAuthn Testing
- Works on HTTPS (localhost is considered secure)
- Requires compatible device (fingerprint, Face ID, or security key)
- Falls back to PIN entry if biometrics unavailable

## 📁 Project Structure

```
echopay/
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/               # Page components
│   ├── lib/
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── webauthn.ts      # Biometric authentication
│   │   ├── paymentAdapters/ # Payment gateway integrations
│   │   └── ai/              # AI and voice processing
│   ├── stores/              # Zustand state management
│   └── App.tsx              # Main application component
├── netlify/functions/       # Serverless backend functions
├── firestore.rules          # Database security rules
├── database.rules.json      # Realtime DB security rules
└── netlify.toml            # Netlify configuration
```

## 🔒 Security Checklist

- ✅ Firebase security rules prevent unauthorized access
- ✅ Server-side token verification on all API endpoints
- ✅ WebAuthn signatures for payment confirmation
- ✅ Nonce-based replay attack prevention
- ✅ Request timeout validation (5-minute window)
- ✅ Audit logging for all sensitive operations
- ✅ Environment variables for sensitive data
- ✅ HTTPS-only communication

## 🚀 Deployment

### Deploy to Netlify
1. Connect your Git repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy:
   ```bash
   # Build the project
   npm run build
   
   # Deploy functions and site
   netlify deploy --prod
   ```

### Production Considerations
1. **Domain Setup**: Configure custom domain with SSL
2. **Environment Variables**: Set production Firebase and Gemini credentials
3. **Rate Limiting**: Implement rate limiting on Netlify functions
4. **Monitoring**: Set up error tracking (Sentry, LogRocket)
5. **Backup**: Regular Firestore exports
6. **Compliance**: Ensure PCI DSS compliance for card payments

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Voice-powered payments
- ✅ Biometric authentication
- ✅ Mock payment adapters
- ✅ AI assistant integration

### Phase 2
- [ ] Real payment gateway integration
- [ ] Push notifications
- [ ] Recurring payments
- [ ] Transaction exports

### Phase 3
- [ ] Multi-language support
- [ ] Advanced fraud detection
- [ ] Merchant payment links
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For technical support:
- Check the [Issues](https://github.com/your-repo/echopay/issues) page
- Review the troubleshooting section below
- Contact the development team

### Troubleshooting

**Voice recognition not working:**
- Ensure HTTPS connection
- Check browser permissions for microphone
- Try in Chrome/Edge (best Web Speech API support)

**Biometric authentication fails:**
- Verify device supports WebAuthn
- Check that localhost or HTTPS is used
- Clear browser data and re-register

**Payment simulation not working:**
- Check console for errors
- Verify Firebase configuration
- Ensure Netlify functions are running

**Firebase connection issues:**
- Verify environment variables
- Check Firebase project settings
- Ensure security rules are deployed