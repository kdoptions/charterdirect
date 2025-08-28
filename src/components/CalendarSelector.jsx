import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, AlertCircle, CheckCircle, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { realGoogleCalendarService } from '@/api/realGoogleCalendarService';
import { Boat } from '@/api/entities';
import { Link } from 'react-router-dom';

export default function CalendarSelector({ boat, onCalendarUpdate, currentUser }) {
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(boat?.google_calendar_id || '');
  const [calendarName, setCalendarName] = useState(boat?.calendar_name || '');
  const [calendarColor, setCalendarColor] = useState(boat?.calendar_color_id || '1');
  const [isEnabled, setIsEnabled] = useState(boat?.calendar_integration_enabled || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userCalendarData, setUserCalendarData] = useState(null);

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

  const loadUserCalendarData = async () => {
    try {
      console.log('🔍 Loading user calendar data from database...');
      
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
      
      console.log('🔍 User calendar data loaded:', userData);
      setUserCalendarData(userData);
    } catch (error) {
      console.error('Error loading user calendar data:', error);
    }
  };

  const loadUserCalendars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user has Google Calendar integration
      console.log('🔍 CalendarSelector - userCalendarData:', userCalendarData);
      console.log('🔍 CalendarSelector - checking for calendar integration...');
      
      // Check if user has Google Calendar integration from database
      if (!userCalendarData?.google_integration_active) {
        setError('Google Calendar integration not set up. Please connect your Google Calendar first.');
        return;
      }

      // Fetch real calendars from Google Calendar API
      const freshTokenData = await realGoogleCalendarService.getFreshAccessToken(
        userCalendarData.google_refresh_token
      );
      
      const realCalendars = await realGoogleCalendarService.getUserCalendars(freshTokenData.access_token);
      console.log('📅 Calendars received from Google API:', realCalendars);
      setCalendars(realCalendars);
      
      // If no calendar is selected, use the default or first available
      if (!selectedCalendar && realCalendars.length > 0) {
        setSelectedCalendar(realCalendars[0].id);
        setCalendarName(realCalendars[0].summary); // Use 'summary' not 'name'
      }
    } catch (err) {
      console.error('Error loading calendars:', err);
      setError('Failed to load calendars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (isEnabled && !selectedCalendar) {
        setError('Please select a calendar when enabling integration.');
        return;
      }

      // Update boat with calendar settings
      const updateData = {
        google_calendar_id: isEnabled ? selectedCalendar : null,
        calendar_name: isEnabled ? calendarName : null,
        calendar_color_id: isEnabled ? calendarColor : null,
        calendar_integration_enabled: isEnabled
      };

      await Boat.update(boat.id, updateData);
      
      setSuccess(true);
      if (onCalendarUpdate) {
        onCalendarUpdate(updateData);
      }

      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating calendar settings:', err);
      setError('Failed to update calendar settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsEnabled(false);
    setSelectedCalendar('');
    setCalendarName('');
    setCalendarColor('1');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="calendar-enabled">Enable Calendar Integration</Label>
            <p className="text-sm text-gray-500">
              Connect this boat to a Google Calendar for automatic booking management
            </p>
          </div>
          <Switch
            id="calendar-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            disabled={loading}
          />
        </div>

        {isEnabled && (
          <>
            {/* Calendar Selection */}
            <div className="space-y-2">
              <Label htmlFor="calendar-select">Select Calendar</Label>
              <Select
                value={selectedCalendar}
                onValueChange={(value) => {
                  setSelectedCalendar(value);
                  const calendar = calendars.find(c => c.id === value);
                  if (calendar) {
                    setCalendarName(calendar.name);
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a calendar" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {calendar.summary}
                        {calendar.primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar Name */}
            <div className="space-y-2">
              <Label htmlFor="calendar-name">Calendar Display Name</Label>
              <input
                id="calendar-name"
                type="text"
                value={calendarName}
                onChange={(e) => setCalendarName(e.target.value)}
                placeholder="e.g., Boat Float Bookings"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Calendar Color */}
            <div className="space-y-2">
              <Label>Calendar Color</Label>
              <div className="flex flex-wrap gap-2">
                {calendarColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setCalendarColor(color.id)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      calendarColor === color.id 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Multiple Boats Warning */}
            {boat?.owner_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Multiple Boats on Same Calendar</p>
                    <p>
                      Multiple boats can use the same calendar simultaneously. Each boat maintains 
                      its own availability - booking one boat won't block other boats from being 
                      booked at the same time. This helps you organize all your boat schedules in one place.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Calendar settings updated successfully!</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={loading || (isEnabled && !selectedCalendar)}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
          
          {isEnabled && (
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={loading}
            >
              Disable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
