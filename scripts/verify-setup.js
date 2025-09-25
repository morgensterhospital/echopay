#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run with: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');

function verifySetup() {
  console.log('🔍 EchoPay Setup Verification\n');

  const envPath = path.join(process.cwd(), '.env');
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY'
  ];

  const optionalVars = [
    'GEMINI_API_KEY',
    'VITE_GEMINI_API_KEY'
  ];

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    console.log('💡 Run: node scripts/setup-env.js to create it\n');
    return false;
  }

  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  let allGood = true;

  // Check required variables
  console.log('📋 Required Variables:');
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value === 'your_value_here' || value.includes('...')) {
      console.log(`❌ ${varName}: Missing or placeholder value`);
      allGood = false;
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  });

  // Check optional variables
  console.log('\n🔧 Optional Variables:');
  optionalVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value === 'your_value_here' || value.includes('...')) {
      console.log(`⚠️  ${varName}: Not configured (AI features will use mocks)`);
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  });

  // Check Firebase private key format
  const privateKey = envVars.FIREBASE_ADMIN_PRIVATE_KEY;
  if (privateKey) {
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('\\n')) {
      console.log('\n❌ FIREBASE_ADMIN_PRIVATE_KEY: Invalid format');
      console.log('💡 Should include BEGIN/END markers and \\n for line breaks');
      allGood = false;
    }
  }

  // Check project consistency
  const clientProjectId = envVars.VITE_FIREBASE_PROJECT_ID;
  const adminProjectId = envVars.FIREBASE_PROJECT_ID;
  
  if (clientProjectId && adminProjectId && clientProjectId !== adminProjectId) {
    console.log('\n⚠️  Project ID mismatch between client and admin configs');
  }

  console.log('\n' + '='.repeat(50));
  
  if (allGood) {
    console.log('✅ Setup looks good! You can now run:');
    console.log('   npm run dev');
    console.log('   netlify dev (in another terminal)');
  } else {
    console.log('❌ Setup incomplete. Please fix the issues above.');
    console.log('💡 Run: node scripts/setup-env.js for guided setup');
  }

  console.log('\n📚 For detailed setup instructions, see:');
  console.log('   - README.md');
  console.log('   - ENVIRONMENT_SETUP.md');

  return allGood;
}

if (require.main === module) {
  verifySetup();
}

module.exports = { verifySetup };