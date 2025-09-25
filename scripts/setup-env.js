#!/usr/bin/env node

/**
 * Environment Setup Helper Script
 * Run with: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('🚀 EchoPay Environment Setup Helper\n');
  console.log('This script will help you create your .env file with the required variables.\n');

  const envVars = {};

  // Firebase Client Configuration
  console.log('📱 Firebase Client Configuration');
  console.log('Get these from Firebase Console > Project Settings > Your apps > Web app\n');
  
  envVars.VITE_FIREBASE_API_KEY = await question('Firebase API Key: ');
  envVars.VITE_FIREBASE_AUTH_DOMAIN = await question('Firebase Auth Domain (project-id.firebaseapp.com): ');
  envVars.VITE_FIREBASE_PROJECT_ID = await question('Firebase Project ID: ');
  envVars.VITE_FIREBASE_STORAGE_BUCKET = await question('Firebase Storage Bucket (project-id.appspot.com): ');
  envVars.VITE_FIREBASE_MESSAGING_SENDER_ID = await question('Firebase Messaging Sender ID: ');
  envVars.VITE_FIREBASE_APP_ID = await question('Firebase App ID: ');

  // Firebase Admin Configuration
  console.log('\n🔧 Firebase Admin Configuration');
  console.log('Get these from Firebase Console > Project Settings > Service accounts\n');
  
  envVars.FIREBASE_PROJECT_ID = envVars.VITE_FIREBASE_PROJECT_ID;
  envVars.FIREBASE_CLIENT_EMAIL = await question('Firebase Client Email (service account): ');
  
  console.log('\nFor the private key, paste the entire key including BEGIN/END lines:');
  const privateKey = await question('Firebase Private Key: ');
  envVars.FIREBASE_ADMIN_PRIVATE_KEY = `"${privateKey.replace(/\n/g, '\\n')}"`;

  // Optional: Gemini API
  console.log('\n🤖 Google Gemini AI (Optional)');
  const useGemini = await question('Do you want to configure Gemini AI? (y/n): ');
  
  if (useGemini.toLowerCase() === 'y') {
    envVars.GEMINI_API_KEY = await question('Gemini API Key: ');
    envVars.VITE_GEMINI_API_KEY = envVars.GEMINI_API_KEY;
  }

  // Development Settings
  envVars.MOCK_MODE = 'true';
  envVars.VITE_MOCK_MODE = 'true';
  envVars.NODE_ENV = 'development';

  // Generate .env file
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const envPath = path.join(process.cwd(), '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run dev');
    console.log('3. Run: netlify dev (in another terminal)');
    console.log('4. Open: http://localhost:8888');
    console.log('\n🔒 Remember to:');
    console.log('- Never commit your .env file');
    console.log('- Add the same variables to Netlify dashboard for deployment');
    console.log('- Enable Firebase Authentication and Firestore in Firebase Console');
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
  }

  rl.close();
}

if (require.main === module) {
  setupEnvironment().catch(console.error);
}

module.exports = { setupEnvironment };