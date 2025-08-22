// Real Google Calendar Service
// This replaces the mock service with actual Google Calendar API integration

class RealGoogleCalendarService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    
    // Automatically detect the right redirect URI based on environment
    this.redirectUri = this.getRedirectUri();
    
    this.scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';
  }

  // Get redirect URI (Vercel production only)
  getRedirectUri() {
    // Use the configured Vercel redirect URI
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    
    if (!redirectUri) {
      throw new Error('VITE_GOOGLE_REDIRECT_URI environment variable is required');
    }
    
    return redirectUri;
  }

  // Initialize Google API
  async initGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: this.clientId
          }).then(resolve).catch(reject);
        });
      } else {
        reject(new Error('Google API not loaded'));
      }
    });
  }

  // Get OAuth URL for calendar connection
  getAuthUrl() {
    console.log('🔍 Debug: getAuthUrl called');
    console.log('🔍 Debug: this.redirectUri =', this.redirectUri);
    console.log('🔍 Debug: this.clientId =', this.clientId);
    console.log('🔍 Debug: this.clientSecret =', this.clientSecret ? 'present' : 'missing');
    console.log('🔍 Debug: window.location.hostname =', window.location.hostname);
    
    if (!this.clientId) {
      throw new Error('Missing Google Client ID. Please check your VITE_GOOGLE_CLIENT_ID environment variable.');
    }
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('🔍 Debug: Generated auth URL =', authUrl);
    
    return authUrl;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code) {
    // Debug logging
    console.log('🔍 Debug: exchangeCodeForTokens called with code:', code ? 'present' : 'missing');
    console.log('🔍 Debug: clientId:', this.clientId ? 'present' : 'missing');
    console.log('🔍 Debug: clientSecret:', this.clientSecret ? 'present' : 'missing');
    console.log('🔍 Debug: redirectUri:', this.redirectUri);
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Missing Google OAuth credentials. Please check your environment variables.');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Debug: Token exchange failed with status:', response.status);
      console.error('🔍 Debug: Error response:', errorText);
      throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    console.log('🔍 Debug: Token exchange successful, received:', Object.keys(tokenData));
    return tokenData;
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return await response.json();
  }

  // Check calendar availability
  async checkAvailability(calendarId, timeMin, timeMax, accessToken) {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: timeMin,
          timeMax: timeMax,
          items: [{ id: calendarId }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check calendar availability');
    }

    const data = await response.json();
    return {
      success: true,
      busy: data.calendars[calendarId]?.busy || [],
    };
  }

  // Create calendar event for booking
  async createBookingEvent(calendarId, bookingData, accessToken) {
    const event = {
      summary: `Boat Booking: ${bookingData.customer_name}`,
      description: `Boat booking for ${bookingData.guests} guests\nCustomer: ${bookingData.customer_name}\nEmail: ${bookingData.customer_email}\nPhone: ${bookingData.customer_phone}\nSpecial Requests: ${bookingData.special_requests || 'None'}`,
      start: {
        dateTime: bookingData.start_datetime,
        timeZone: 'Australia/Sydney',
      },
      end: {
        dateTime: bookingData.end_datetime,
        timeZone: 'Australia/Sydney',
      },
      attendees: [
        { email: bookingData.customer_email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
      colorId: bookingData.is_custom_time ? '11' : '10', // Red for custom time, Green for standard
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create calendar event');
    }

    const createdEvent = await response.json();
    return {
      success: true,
      eventId: createdEvent.id,
      eventLink: createdEvent.htmlLink,
    };
  }

  // Update calendar event (for booking status changes)
  async updateBookingEvent(calendarId, eventId, bookingData, accessToken) {
    const event = {
      summary: `Boat Booking: ${bookingData.customer_name} (${bookingData.status})`,
      description: `Boat booking for ${bookingData.guests} guests\nStatus: ${bookingData.status}\nCustomer: ${bookingData.customer_name}\nEmail: ${bookingData.customer_email}\nPhone: ${bookingData.customer_phone}\nSpecial Requests: ${bookingData.special_requests || 'None'}`,
      start: {
        dateTime: bookingData.start_datetime,
        timeZone: 'Australia/Sydney',
      },
      end: {
        dateTime: bookingData.end_datetime,
        timeZone: 'Australia/Sydney',
      },
      colorId: this.getColorIdForStatus(bookingData.status),
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update calendar event');
    }

    return { success: true };
  }

  // Delete calendar event (for cancelled bookings)
  async deleteBookingEvent(calendarId, eventId, accessToken) {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete calendar event');
    }

    return { success: true };
  }

  // Get color ID based on booking status
  getColorIdForStatus(status) {
    switch (status) {
      case 'confirmed':
        return '10'; // Green
      case 'pending_approval':
        return '5'; // Yellow
      case 'rejected':
        return '11'; // Red
      case 'cancelled':
        return '8'; // Gray
      default:
        return '10'; // Green
    }
  }

  // Send booking notification email
  async sendBookingNotification(bookingData, eventLink) {
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log('Sending booking notification:', {
      to: bookingData.customer_email,
      subject: `Booking ${bookingData.status}: ${bookingData.boat_name}`,
      eventLink: eventLink,
      bookingData: bookingData
    });

    // Mock implementation - replace with real email service
    return { success: true, messageId: 'mock-message-id' };
  }

  // Get user's calendars
  async getUserCalendars(accessToken) {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get user calendars');
    }

    const data = await response.json();
    return data.items.map(calendar => ({
      id: calendar.id,
      summary: calendar.summary,
      primary: calendar.primary || false,
    }));
  }
}

// Export singleton instance
export const realGoogleCalendarService = new RealGoogleCalendarService();
export default realGoogleCalendarService; 