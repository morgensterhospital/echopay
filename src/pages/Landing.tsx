import React from 'react';
import { ArrowRight, Shield, Zap, Mic, Smartphone, Globe } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EchoPay</span>
          </div>
          <Link to="/auth">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Pay with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Your Voice
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The future of payments is here. Pay bills, send money, and manage your finances 
            using natural voice commands and secure biometric authentication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="flex items-center gap-2">
                Start Using EchoPay
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mic className="h-8 w-8 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">"Pay ZESA $20 to account 1234567"</p>
                    <p className="text-sm text-gray-500">Voice command processed</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="font-medium">ZESA Payment</p>
                      <p className="text-sm text-gray-600">Account: 1234567</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">$20.00</p>
                      <p className="text-xs text-green-600">✓ Confirmed via biometrics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20 -z-10 scale-110"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Revolutionary Payment Experience
            </h2>
            <p className="text-xl text-gray-600">
              Combining AI voice recognition with biometric security for seamless transactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Voice Payments */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Voice Commands</h3>
              <p className="text-gray-600">
                Simply speak your payment instructions. Our AI understands natural language 
                and processes complex transactions instantly.
              </p>
            </div>

            {/* Biometric Security */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Biometric Security</h3>
              <p className="text-gray-600">
                Your fingerprint or face ID confirms every transaction. No passwords, 
                no PINs - just secure, convenient authentication.
              </p>
            </div>

            {/* Smart Integration */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Integration</h3>
              <p className="text-gray-600">
                Connect your EcoCash, bank cards, and mobile wallets. 
                One app for all your payment needs in Zimbabwe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What You Can Do
            </h2>
            <p className="text-xl text-gray-600">
              From utility bills to peer-to-peer transfers, EchoPay handles it all
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'ZESA Bills', desc: 'Pay electricity bills instantly', icon: '⚡' },
              { title: 'Airtime & Data', desc: 'Top up any network with voice', icon: '📱' },
              { title: 'Send Money', desc: 'Transfer to any mobile number', icon: '💸' },
              { title: 'Bill Reminders', desc: 'AI suggests recurring payments', icon: '🔔' },
            ].map((useCase, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-4xl mb-3">{useCase.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-600">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Bank-Grade Security
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">End-to-End Encryption</h3>
                    <p className="text-gray-600">All transactions are encrypted and secure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Biometric Verification</h3>
                    <p className="text-gray-600">Your biometrics never leave your device</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Fraud Detection</h3>
                    <p className="text-gray-600">AI monitors for suspicious activity 24/7</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center">
                <Shield className="h-24 w-24 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Security First</h3>
                <p className="text-gray-600">Protected by enterprise-grade security protocols</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Payments?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who've already switched to voice-powered payments
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EchoPay</span>
            </div>
            <p className="text-gray-400">© 2025 EchoPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;