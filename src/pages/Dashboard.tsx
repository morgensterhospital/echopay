import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Zap, 
  Smartphone, 
  Send, 
  Bell, 
  Settings, 
  LogOut,
  Mic,
  Eye,
  TrendingUp,
  Clock
} from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import VoiceAssistant from '../components/VoiceAssistant';

const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();
  const { 
    balance, 
    transactions, 
    notifications, 
    loadTransactions, 
    loadNotifications,
    paymentMethods,
    loadPaymentMethods 
  } = useAppStore();
  
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    if (user) {
      loadTransactions(user.uid);
      loadNotifications(user.uid);
      loadPaymentMethods(user.uid);
    }
  }, [user, loadTransactions, loadNotifications, loadPaymentMethods]);

  const quickActions = [
    { 
      icon: Zap, 
      label: 'Pay ZESA', 
      color: 'bg-yellow-500 hover:bg-yellow-600',
      href: '/payments/zesa'
    },
    { 
      icon: Smartphone, 
      label: 'Airtime', 
      color: 'bg-green-500 hover:bg-green-600',
      href: '/payments/airtime'
    },
    { 
      icon: Send, 
      label: 'Send Money', 
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/payments/send'
    },
    { 
      icon: Wallet, 
      label: 'Top Up', 
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/payments/topup'
    },
  ];

  const recentTransactions = transactions.slice(0, 5);
  const unreadNotifications = notifications.filter(n => !n.read);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionIcon = (service: string) => {
    switch (service) {
      case 'ZESA':
        return <Zap className="h-5 w-5 text-yellow-400" />;
      case 'AIRTIME':
        return <Smartphone className="h-5 w-5 text-green-400" />;
      case 'DATA':
        return <Smartphone className="h-5 w-5 text-blue-400" />;
      case 'SEND':
        return <Send className="h-5 w-5 text-purple-400" />;
      default:
        return <Wallet className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleVoiceIntent = (intent: any) => {
    console.log('Voice intent received:', intent);
    // Handle voice-initiated payments here
    // This would typically navigate to a payment confirmation screen
    setShowVoiceAssistant(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">EchoPay</h1>
                <p className="text-sm text-gray-400">Welcome back, {profile?.name || 'User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice Assistant Button */}
              <Button
                variant="ghost"
                onClick={() => setShowVoiceAssistant(true)}
                className="text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <Mic className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Link to="/notifications">
                <Button variant="ghost" className="relative text-gray-400 hover:bg-gray-700 hover:text-white">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications.length}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Settings */}
              <Link to="/settings">
                <Button variant="ghost" className="text-gray-400 hover:bg-gray-700 hover:text-white">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>

              {/* Sign Out */}
              <Button variant="ghost" onClick={signOut} className="text-gray-400 hover:bg-gray-700 hover:text-white">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white mb-8 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Balance</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-bold">
                  {showBalance ? formatCurrency(balance) : '••••••'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white/20 p-1 rounded-full"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">This Month</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-300" />
                <span className="text-sm font-medium text-green-300">+12.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:bg-gray-700/50 hover:border-purple-500 transition-all duration-300">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-white">{action.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
                <Link to="/transactions">
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:bg-gray-700">View All</Button>
                </Link>
              </div>

              <div className="divide-y divide-gray-700">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                          {getTransactionIcon(transaction.service)}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {transaction.service} 
                            {transaction.recipient && ` - ${transaction.recipient}`}
                            {transaction.account && ` - ${transaction.account}`}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{transaction.createdAt.toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'SUCCESS' 
                                ? 'bg-green-900/50 text-green-300'
                                : transaction.status === 'FAILED'
                                ? 'bg-red-900/50 text-red-300'
                                : 'bg-yellow-900/50 text-yellow-300'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.service === 'SEND' ? 'text-red-400' : 'text-white'
                        }`}>
                          {transaction.service === 'SEND' ? '-' : ''}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Your transactions will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Suggestions & Notifications */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Mic className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
              </div>
              <p className="text-gray-300 mb-4">
                "It looks like it's time for your monthly ZESA payment. Would you like me to help you pay now?"
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowVoiceAssistant(true)}>
                  Pay Now
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gray-700">
                  Remind Later
                </Button>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Notifications</h3>
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:bg-gray-700">View All</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border ${
                    notification.read 
                      ? 'border-gray-700 bg-gray-800/50'
                      : 'border-blue-700 bg-blue-900/50'
                  }`}>
                    <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{notification.body}</p>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Assistant Modal */}
      <Modal
        isOpen={showVoiceAssistant}
        onClose={() => setShowVoiceAssistant(false)}
        title="AI Assistant"
        size="lg"
      >
        <VoiceAssistant onPaymentIntent={handleVoiceIntent} />
      </Modal>
    </div>
  );
};

export default Dashboard;