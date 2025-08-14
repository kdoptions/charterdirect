import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    navigate('/dashboard');
    return null;
  }

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful auth
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚤 Harbour Lux
          </h1>
          <p className="text-gray-600">
            Premium Boat Rentals & Experiences
          </p>
        </div>

        {/* Auth Form */}
        {isLogin ? (
          <Login 
            onSwitchToSignup={handleSwitchToSignup}
            onLoginSuccess={handleAuthSuccess}
          />
        ) : (
          <Signup 
            onSwitchToLogin={handleSwitchToLogin}
            onSignupSuccess={handleAuthSuccess}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Harbour Lux. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 