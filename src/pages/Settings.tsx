import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Shield, Palette, Bell, LogOut } from 'lucide-react';
import Button from '../components/Button';

const Settings: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();

  const settingsSections = [
    {
      title: 'Profile',
      icon: User,
      description: 'Update your personal information',
      link: '/settings/profile',
    },
    {
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of the app',
      link: '/settings/appearance',
    },
    {
      title: 'Security',
      icon: Shield,
      description: 'Manage your payment methods and login options',
      link: '/settings/security',
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Control which alerts you receive',
      link: '/settings/notifications',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <Button variant="ghost" onClick={signOut} className="text-gray-400 hover:bg-gray-700 hover:text-white">
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {settingsSections.map((section) => (
            <div key={section.title} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:bg-gray-700/50 hover:border-purple-500 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                  <section.icon className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                  <p className="text-sm text-gray-400">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Settings;