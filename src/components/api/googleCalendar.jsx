
// Mock function for calendar event creation
const createCalendarEventFunction = async (data) => {
  console.log('Mock calendar event creation:', data);
  return { success: true, event: { id: 'mock-event-' + Date.now() } };
};

// Google Calendar API integration for availability and booking management
export class GoogleCalendarAPI {
  constructor() {
    this.clientId = '648615419074-t60do5k8jkk6utrnssvh6kggmfjdkgel.apps.googleusercontent.com';
    this.apiKey = 'placeholder-api-key';
    this.scopes = 'https://www.googleapis.com/auth/calendar';
  }

  // Initialize Google API OAuth
  async initGoogleAuth() {
    try {
      // Use the correct OAuth 2.0 v2 authorization endpoint
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('redirect_uri', `${window.location.origin}/calendar-callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', this.scopes);
      authUrl.searchParams.set('access_type', 'offline'); // Request a refresh token
      authUrl.searchParams.set('prompt', 'consent'); // Prompt user for consent even if already granted

      return {
        success: true,
        authUrl: authUrl.toString()
      };
    } catch (error) {
      console.error('Google Auth initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle OAuth callback and get access token
  async handleOAuthCallback(code) {
    try {
      // Helper to generate a long random string to better simulate real tokens
      const generateRandomString = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      };

      // In a real implementation, this would make a server-side request to Google
      // For now, we simulate the token exchange with more realistic-looking tokens
      const tokens = {
        access_token: `ya29.${generateRandomString(180)}`,
        refresh_token: `1//${generateRandomString(120)}`,
        scope: this.scopes,
        token_type: 'Bearer',
        expires_in: 3599
      };

      return {
        success: true,
        tokens: tokens
      };
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's calendar list
  async getCalendarList(accessToken) {
    try {
      // Simulate a more realistic calendar list fetch
      const calendars = [
        {
          id: 'primary',
          summary: 'your-email@gmail.com', // The real ID for the primary calendar is the email
          description: 'Main calendar'
        },
        {
          id: `a1b2c3d4e5f6g7h8@group.calendar.google.com`,
          summary: 'Boat Bookings',
          description: 'A secondary calendar for bookings'
        }
      ];

      return {
        success: true,
        calendars: calendars
      };
    } catch (error) {
      console.error('Calendar list fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check availability using FreeBusy API
  async checkAvailability(calendarId, timeMin, timeMax, accessToken) {
    try {
      // Simulate FreeBusy query
      const busyTimes = [
        {
          start: '2025-09-18T16:00:00Z',
          end: '2025-09-18T20:00:00Z'
        },
        {
          start: '2025-09-19T16:00:00Z',
          end: '2025-09-19T20:00:00Z'
        }
      ];

      return {
        success: true,
        busy: busyTimes
      };
    } catch (error) {
      console.error('Availability check error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create calendar event for confirmed booking
  async createBookingEvent(calendarId, eventData, accessToken) {
    try {
      // Call the new backend function instead of the simulation
      const { data, error } = await createCalendarEventFunction({
        calendarId,
        eventData,
        accessToken,
      });

      if (error || !data || !data.success) {
        const errorMessage = error?.message || data?.details?.message || 'Failed to create event via backend.';
        console.error('Backend function error:', errorMessage);
        return { success: false, error: errorMessage };
      }
      
      return {
        success: true,
        event: data.event,
      };

    } catch (err) {
      console.error('Event creation API call error:', err);
      return { success: false, error: err.message };
    }
  }

  // Update existing calendar event
  async updateBookingEvent(calendarId, eventId, eventData, accessToken) {
    try {
      // Simulate event update
      return {
        success: true,
        eventId: eventId
      };
    } catch (error) {
      console.error('Event update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete calendar event
  async deleteBookingEvent(calendarId, eventId, accessToken) {
    try {
      // Simulate event deletion
      return {
        success: true,
        eventId: eventId
      };
    } catch (error) {
      console.error('Event deletion error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const googleCalendar = new GoogleCalendarAPI();
