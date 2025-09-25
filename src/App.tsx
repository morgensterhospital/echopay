import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

// Add these placeholder components for now
const Onboarding = () => <div className="p-8">Onboarding page - coming soon</div>;
const Payments = () => <div className="p-8">Payments page - coming soon</div>;
const Transactions = () => <div className="p-8">Transactions page - coming soon</div>;
const Assistant = () => <div className="p-8">Assistant page - coming soon</div>;
const Settings = () => <div className="p-8">Settings page - coming soon</div>;
const Admin = () => <div className="p-8">Admin page - coming soon</div>;
const Notifications = () => <div className="p-8">Notifications page - coming soon</div>;

function App() {
  const { user, loading, initialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return unsubscribe;
  }, [initializeAuth]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">EchoPay</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />

          {/* Protected routes */}
          <Route 
            path="/onboarding" 
            element={user ? <Onboarding /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/payments/*" 
            element={user ? <Payments /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/transactions" 
            element={user ? <Transactions /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/assistant" 
            element={user ? <Assistant /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/notifications" 
            element={user ? <Notifications /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/settings" 
            element={user ? <Settings /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/admin" 
            element={user ? <Admin /> : <Navigate to="/auth" />} 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;