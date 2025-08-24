import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { realGoogleCalendarService } from '@/api/realGoogleCalendarService';

const BoatCalendarManager = ({ boat, ownerCalendarData, onUpdate }) => {
  const [availableCalendars, setAvailableCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('');
  const [useOwnerDefault, setUseOwnerDefault] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (boat) {
      setSelectedCalendarId(boat.google_calendar_id || '');
      setUseOwnerDefault(boat.use_owner_default_calendar !== false);
    }
  }, [boat]);

  // Load available calendars when component mounts
  useEffect(() => {
    if (ownerCalendarData?.google_refresh_token) {
      loadAvailableCalendars();
    }
  }, [ownerCalendarData]);

  const loadAvailableCalendars = async () => {
    try {
      setLoading(true);
      const freshTokenData = await realGoogleCalendarService.getFreshAccessToken(
        ownerCalendarData.google_refresh_token
      );
      
      const calendars = await realGoogleCalendarService.getUserCalendars(freshTokenData.access_token);
      setAvailableCalendars(calendars);
    } catch (error) {
      console.error('Failed to load calendars:', error);
      setError('Failed to load available calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarChange = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update boat with new calendar settings
      const updateData = {
        use_owner_default_calendar: useOwnerDefault,
        google_calendar_id: useOwnerDefault ? null : selectedCalendarId,
        calendar_name: useOwnerDefault ? null : availableCalendars.find(c => c.id === selectedCalendarId)?.summary
      };

      // This would update the boat in your database
      // await Boat.update(boat.id, updateData);
      
      // For now, just call the onUpdate callback
      if (onUpdate) {
        onUpdate(updateData);
      }

      console.log('✅ Calendar settings updated for boat:', boat.name);
    } catch (error) {
      console.error('Failed to update calendar settings:', error);
      setError('Failed to update calendar settings');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCalendarInfo = () => {
    if (useOwnerDefault) {
      return {
        name: 'Owner Default Calendar',
        id: ownerCalendarData?.google_calendar_id || 'primary',
        type: 'default'
      };
    }
    
    const calendar = availableCalendars.find(c => c.id === selectedCalendarId);
    return {
      name: calendar?.summary || 'Unknown Calendar',
      id: selectedCalendarId,
      type: 'boat-specific'
    };
  };

  const currentCalendar = getCurrentCalendarInfo();

  if (!ownerCalendarData?.google_integration_active) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            Calendar Integration Not Set Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 text-sm">
            You need to connect your Google Calendar first to manage boat-specific calendars.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Calendar Settings for {boat.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Calendar Display */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Current Calendar:</span>
            <span className="text-sm">{currentCalendar.name}</span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            ID: {currentCalendar.id}
          </div>
        </div>

        {/* Calendar Selection */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="use-default"
              name="calendar-type"
              checked={useOwnerDefault}
              onChange={() => setUseOwnerDefault(true)}
              className="text-blue-600"
            />
            <Label htmlFor="use-default" className="text-sm font-medium">
              Use Owner Default Calendar
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="use-specific"
              name="calendar-type"
              checked={!useOwnerDefault}
              onChange={() => setUseOwnerDefault(false)}
              className="text-blue-600"
            />
            <Label htmlFor="use-specific" className="text-sm font-medium">
              Use Boat-Specific Calendar
            </Label>
          </div>

          {!useOwnerDefault && (
            <div className="ml-6">
              <Label htmlFor="calendar-select" className="text-sm text-gray-600">
                Select Calendar:
              </Label>
              <Select
                value={selectedCalendarId}
                onValueChange={setSelectedCalendarId}
                disabled={loading}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose a calendar" />
                </SelectTrigger>
                <SelectContent>
                  {availableCalendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.summary} {calendar.primary && '(Primary)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleCalendarChange}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Updating...' : 'Update Calendar Settings'}
          </Button>
          
          <Button
            variant="outline"
            onClick={loadAvailableCalendars}
            disabled={loading}
          >
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 pt-2">
          <p>• <strong>Owner Default:</strong> All boats share your main calendar</p>
          <p>• <strong>Boat-Specific:</strong> Each boat has its own calendar</p>
          <p>• Changes take effect immediately for new bookings</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BoatCalendarManager;
