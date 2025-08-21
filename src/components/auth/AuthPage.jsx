import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect to home page
  if (currentUser) {
    navigate('/');
    return null;
  }

  // Handle redirects from protected features
  useEffect(() => {
    const redirectMessage = location.state?.redirectMessage;
    if (redirectMessage) {
      // Show a temporary alert for the redirect message
      // This will be replaced by a proper UI component later
      alert(redirectMessage);
      // Optionally, you might want to clear the state after a short delay
      // setTimeout(() => {
      //   navigate('/dashboard', { replace: true });
      // }, 3000); // Redirect after 3 seconds
    }
  }, [location.state]);

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleAuthSuccess = () => {
    // Check for redirect destination
    const redirectTo = localStorage.getItem('redirectAfterLogin');
    if (redirectTo) {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
    } else {
      // Default redirect to home page
      navigate('/');
    }
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