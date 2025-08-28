import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import realGoogleCalendarService from '@/api/realGoogleCalendarService';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function CalendarConnection({ userId, onConnectionChange }) {
  const { currentUser } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated
  if (!currentUser) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <LogIn className="w-5 h-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-4">
            You must be logged in to access calendar integration features.
          </p>
          <div className="flex gap-3">
            <Link to="/login">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                Create Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    // Check if user has existing calendar connection
    checkExistingConnection();
  }, [userId]);

  const checkExistingConnection = async () => {
    try {
      
      // Check localStorage for existing tokens
      const tokens = localStorage.getItem(`google_tokens_${userId}`);
      if (tokens) {
        const { access_token, refresh_token } = JSON.parse(tokens);
        
        // Test if token is still valid
        try {
          const userCalendars = await realGoogleCalendarService.getUserCalendars(access_token);
          setCalendars(userCalendars);
          setConnectionStatus('connected');
          
          // Get saved calendar preference
          const savedCalendar = localStorage.getItem(`selected_calendar_${userId}`);
          if (savedCalendar) {
            setSelectedCalendar(savedCalendar);
          } else if (userCalendars.length > 0) {
            const primaryCalendar = userCalendars.find(cal => cal.primary) || userCalendars[0];
            setSelectedCalendar(primaryCalendar.id);
          }
        } catch (error) {
          // Token expired, try to refresh
          try {
            const newTokens = await realGoogleCalendarService.refreshToken(refresh_token);
            localStorage.setItem(`google_tokens_${userId}`, JSON.stringify(newTokens));
            setConnectionStatus('connected');
          } catch (refreshError) {
            // Refresh failed, need to reconnect
            localStorage.removeItem(`google_tokens_${userId}`);
            setConnectionStatus('disconnected');
          }
        }
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setConnectionStatus('error');
      setError('Failed to check calendar connection');
    }
  };

  const connectCalendar = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authUrl = realGoogleCalendarService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating calendar connection:', error);
      setError('Failed to initiate calendar connection');
      setIsLoading(false);
    }
  };

  const disconnectCalendar = async () => {
    try {
      localStorage.removeItem(`google_tokens_${userId}`);
      localStorage.removeItem(`selected_calendar_${userId}`);
      setConnectionStatus('disconnected');
      setCalendars([]);
      setSelectedCalendar('');
      setError(null);
      
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      setError('Failed to disconnect calendar');
    }
  };

  const handleCalendarSelect = (calendarId) => {
    setSelectedCalendar(calendarId);
    localStorage.setItem(`selected_calendar_${userId}`, calendarId);
    
    if (onConnectionChange) {
      onConnectionChange(true, calendarId);
    }
  };

  const refreshConnection = async () => {
    setIsLoading(true);
    setError(null);
    await checkExistingConnection();
    setIsLoading(false);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'connecting':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to Google Calendar';
      case 'connecting':
        return 'Connecting to Google Calendar...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Not Connected';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'connecting':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Debug logging
  console.log('🎨 CalendarConnection render - connectionStatus:', connectionStatus);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Connect your Google Calendar to manage boat bookings and availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          {connectionStatus === 'connected' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active
            </Badge>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Connection Actions */}
        <div className="flex gap-2">
          {connectionStatus === 'disconnected' && (
            <Button 
              onClick={connectCalendar} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          )}

          {connectionStatus === 'connected' && (
            <>
              <Button 
                onClick={refreshConnection} 
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={disconnectCalendar} 
                variant="outline"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </>
          )}
        </div>

        {/* Calendar Selection */}
        {connectionStatus === 'connected' && calendars.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Select Calendar for Bookings:</h4>
            <div className="space-y-2">
              {calendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCalendar === calendar.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleCalendarSelect(calendar.id)}
                >
                  <div>
                    <div className="font-medium">{calendar.summary}</div>
                    <div className="text-sm text-gray-500">{calendar.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {calendar.primary && (
                      <Badge variant="outline" className="text-xs">
                        Primary
                      </Badge>
                    )}
                    {selectedCalendar === calendar.id && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Info */}
        {connectionStatus === 'connected' && (
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p><strong>Connected Calendar:</strong> {selectedCalendar || 'None selected'}</p>
            <p><strong>Features:</strong> Real-time availability, automatic booking events, notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 