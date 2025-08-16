import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut, User, Mail, Calendar } from 'lucide-react';

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const getInitials = (displayName) => {
    if (!displayName) return 'U';
    return displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentUser.user_metadata?.avatar_url} alt={currentUser.user_metadata?.display_name} />
            <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
              {getInitials(currentUser.user_metadata?.display_name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {currentUser.user_metadata?.display_name || 'User'}
        </CardTitle>
        <CardDescription>
          Account Information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-600">{currentUser.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Display Name</p>
            <p className="text-sm text-gray-600">
              {currentUser.user_metadata?.display_name || 'Not set'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Member Since</p>
            <p className="text-sm text-gray-600">
              {formatDate(currentUser.created_at)}
            </p>
          </div>
        </div>
        
        <div className="pt-4">
          <Button
            onClick={handleLogout}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {loading ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 