# Environment Variables Setup Guide

This guide explains exactly what environment variables you need and how to get them.

## Quick Start Checklist

- [ ] Firebase project created and configured
- [ ] Google Cloud project with Gemini API enabled
- [ ] Netlify account created
- [ ] Environment variables configured locally and on Netlify

## 1. Local Development (.env file)

Create a `.env` file in your project root with these variables:

### Required for Basic Functionality

```env
# Firebase Client (from Firebase Console)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (for Netlify Functions)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Development Settings
MOCK_MODE=true
NODE_ENV=development
```

### Optional (for AI features)

```env
# Google Gemini AI
GEMINI_API_KEY=AIza...
VITE_GEMINI_API_KEY=AIza...
```

## 2. Netlify Environment Variables

In your Netlify dashboard (Site settings > Environment variables), add:

### Required Variables

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `FIREBASE_PROJECT_ID` | your-project-id | Same as client config |
| `FIREBASE_CLIENT_EMAIL` | firebase-adminsdk-xxxxx@... | From service account |
| `FIREBASE_ADMIN_PRIVATE_KEY` | "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----" | Include quotes and \n |
| `MOCK_MODE` | true | Set to false for production |
| `NODE_ENV` | development | Change to production when ready |

### Optional Variables

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `GEMINI_API_KEY` | AIza... | For AI assistant features |
| `PAYNOW_INTEGRATION_ID` | your_id | For Zimbabwe payments |
| `PAYNOW_INTEGRATION_KEY` | your_key | For Zimbabwe payments |
| `STRIPE_SECRET_KEY` | sk_... | For international payments |

## 3. How to Get Each Credential

### Firebase Credentials

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Create or select your project**
3. **Get Client Config:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Add app" → Web (</>) if not already created
   - Copy the config values

4. **Get Admin Credentials:**
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract: `project_id`, `client_email`, `private_key`

### Gemini API Key

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create or select a project**
3. **Enable the Generative Language API**
4. **Go to APIs & Services → Credentials**
5. **Click "Create Credentials" → API Key**
6. **Copy the API key**

### Payment Gateway Credentials (Production Only)

#### Paynow (Zimbabwe)
1. Register at [Paynow](https://www.paynow.co.zw)
2. Get Integration ID and Key from dashboard

#### Stripe (International)
1. Register at [Stripe](https://stripe.com)
2. Get API keys from dashboard

## 4. Environment Variable Formats

### Firebase Private Key Format
The private key must include `\n` for line breaks:
```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

### Boolean Values
Use strings, not actual booleans:
```env
MOCK_MODE=true  # Not MOCK_MODE=True or MOCK_MODE=1
```

## 5. Security Best Practices

### Local Development
- Never commit `.env` files to version control
- Use `.env.example` as a template
- Keep sensitive keys secure

### Production
- Use Netlify's environment variable UI
- Enable "Sensitive" flag for private keys
- Rotate keys regularly
- Use different keys for staging/production

## 6. Testing Your Setup

### Verify Firebase Connection
```bash
# Start the app
npm run dev

# Check browser console for Firebase errors
# Should see successful authentication
```

### Verify Netlify Functions
```bash
# Start Netlify dev server
netlify dev

# Test a function
curl http://localhost:8888/.netlify/functions/submitPayment
```

### Verify Gemini AI
```bash
# Open the app and try the voice assistant
# Should respond even without API key (uses mocks)
```

## 7. Common Issues

### Firebase Admin Key Issues
- **Error**: "private_key must be a string"
- **Solution**: Wrap the key in quotes and include `\n` characters

### CORS Issues
- **Error**: "Access-Control-Allow-Origin"
- **Solution**: Ensure functions include CORS headers

### Environment Variables Not Loading
- **Error**: `undefined` values in app
- **Solution**: Restart dev server after changing `.env`

## 8. Production Deployment Checklist

Before deploying to production:

- [ ] Set `MOCK_MODE=false` (only when ready for real payments)
- [ ] Set `NODE_ENV=production`
- [ ] Add real payment gateway credentials
- [ ] Test all flows in staging environment
- [ ] Enable Firebase security rules
- [ ] Set up monitoring and error tracking

## 9. Environment-Specific Configurations

### Development
```env
MOCK_MODE=true
NODE_ENV=development
VITE_FIREBASE_PROJECT_ID=echopay-dev
```

### Staging
```env
MOCK_MODE=true
NODE_ENV=staging
VITE_FIREBASE_PROJECT_ID=echopay-staging
```

### Production
```env
MOCK_MODE=false
NODE_ENV=production
VITE_FIREBASE_PROJECT_ID=echopay-prod
```

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure Firebase services are enabled
4. Check Netlify function logs
5. Review the troubleshooting section in README.md