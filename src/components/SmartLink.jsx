import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SmartLink({ 
  to, 
  children, 
  requiresAuth = false, 
  authMessage = "Please sign in to access this feature",
  ...props 
}) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (requiresAuth && !currentUser) {
      e.preventDefault();
      // Store the intended destination for after login
      localStorage.setItem('redirectAfterLogin', to);
      navigate('/auth', { 
        state: { 
          message: authMessage,
          redirectTo: to 
        } 
      });
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
} 