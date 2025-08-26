import { realGoogleCalendarService } from '@/api/realGoogleCalendarService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AlertCircle, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CalendarIntegrationSelector({ data, updateData }) {
  const { currentUser } = useAuth();
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(data?.google_calendar_id || '');
  const [calendarName, setCalendarName] = useState(data?.calendar_name || '');
  const [calendarColor, setCalendarColor] = useState(data?.calendar_color_id || '1');
  const [isEnabled, setIsEnabled] = useState(data?.calendar_integration_enabled || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCalendarData, setUserCalendarData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);



  // Calendar color options (Google Calendar standard colors)
  const calendarColors = [
    { id: '1', name: 'Blue', hex: '#4285f4' },
    { id: '2', name: 'Green', hex: '#34a853' },
    { id: '3', name: 'Red', hex: '#ea4335' },
    { id: '4', name: 'Yellow', hex: '#fbbc04' },
    { id: '5', name: 'Purple', hex: '#a142f4' },
    { id: '6', name: 'Orange', hex: '#ff6d01' },
    { id: '7', name: 'Teal', hex: '#00bcd4' },
    { id: '8', name: 'Pink', hex: '#e91e63' },
    { id: '9', name: 'Brown', hex: '#795548' },
    { id: '10', name: 'Gray', hex: '#9e9e9e' },
    { id: '11', name: 'Indigo', hex: '#3f51b5' }
  ];

  useEffect(() => {
    if (currentUser) {
      loadUserCalendarData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (isEnabled && userCalendarData?.google_integration_active) {
      loadUserCalendars();
    }
  }, [isEnabled, userCalendarData]);

  // Update parent data when calendar settings change
  useEffect(() => {
    updateData({
      google_calendar_id: selectedCalendar,
      calendar_name: calendarName,
      calendar_color_id: calendarColor,
      calendar_integration_enabled: isEnabled
    });
  }, [selectedCalendar, calendarName, calendarColor, isEnabled, updateData]);

  const loadUserCalendarData = async () => {
    try {
      // Fetch user's calendar integration status from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('google_integration_active, google_calendar_id, google_refresh_token')
        .eq('id', currentUser?.id)
        .single();
      
      if (error) {
        console.error('Error fetching user calendar data:', error);
        return;
      }
      
      setUserCalendarData(userData);
      setIsConnected(userData?.google_integration_active || false);
    } catch (error) {
      console.error('Error loading user calendar data:', error);
    }
  };

  const loadUserCalendars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userCalendarData?.google_integration_active) {
        setError('Google Calendar integration not set up. Please connect your Google Calendar first.');
        return;
      }

      // Fetch real calendars from Google Calendar API
      const freshTokenData = await realGoogleCalendarService.getFreshAccessToken(
        userCalendarData.google_refresh_token
      );
      
      const realCalendars = await realGoogleCalendarService.getUserCalendars(freshTokenData.access_token);
      setCalendars(realCalendars);
      
      // If no calendar is selected, use the default or first available
      if (!selectedCalendar && realCalendars.length > 0) {
        const primaryCalendar = realCalendars.find(cal => cal.primary) || realCalendars[0];
        setSelectedCalendar(primaryCalendar.id);
        setCalendarName(primaryCalendar.summary);
      }
    } catch (error) {
      console.error('Error loading calendars:', error);
      setError('Failed to load calendars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = () => {
    try {
      const authUrl = realGoogleCalendarService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating calendar connection:', error);
      setError('Failed to initiate calendar connection');
    }
  };

  const handleCalendarSelect = (calendarId) => {
    const selectedCal = calendars.find(cal => cal.id === calendarId);
    setSelectedCalendar(calendarId);
    if (selectedCal) {
      setCalendarName(selectedCal.summary);
    }
  };

  const handleEnableToggle = (enabled) => {
    setIsEnabled(enabled);
    if (!enabled) {
      setSelectedCalendar('');
      setCalendarName('');
      setError(null);
    } else if (!isConnected) {
      setError('Please connect your Google Calendar first');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Calendar Connection:</span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
          
          {!isConnected && (
            <Button 
              onClick={connectGoogleCalendar}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </Button>
          )}
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="calendar-toggle" className="text-sm font-medium">
              Enable Calendar Integration
            </Label>
            <p className="text-xs text-slate-500">
              Sync this boat's availability with your Google Calendar
            </p>
          </div>
          <Switch
            id="calendar-toggle"
            checked={isEnabled}
            onCheckedChange={handleEnableToggle}
            disabled={!isConnected}
          />
        </div>

        {/* Calendar Selection */}
        {isEnabled && isConnected && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="calendar-select" className="text-sm font-medium">
                Select Calendar
              </Label>
              <Select value={selectedCalendar} onValueChange={handleCalendarSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a calendar" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: calendar.backgroundColor || '#4285f4' }}
                        />
                        {calendar.summary}
                        {calendar.primary && (
                          <Badge variant="outline" className="text-xs">Primary</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar Color */}
            <div>
              <Label htmlFor="calendar-color" className="text-sm font-medium">
                Event Color
              </Label>
              <Select value={calendarColor} onValueChange={setCalendarColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calendarColors.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-slate-600">Loading calendars...</span>
          </div>
        )}

        {/* Help Text */}
        {!isConnected && (
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-md">
            <div className="font-medium mb-1">💡 Why connect your Google Calendar?</div>
            <ul className="space-y-1">
              <li>• Automatically sync boat availability</li>
              <li>• Prevent double-bookings</li>
              <li>• Manage your schedule in one place</li>
              <li>• Professional booking management</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
