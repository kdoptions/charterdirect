# Google Calendar Integration Setup Guide

## 1. Google Cloud Console Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### Step 2: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `https://yourdomain.com/CalendarCallback` (for production - primary)
   - `http://localhost:5174/CalendarCallback` (for development - optional)
5. Download the client configuration JSON file

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in app information:
   - App name: "Harbour Lux"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Add test users (your email addresses)

## 2. Environment Variables

Create a `.env` file in your project root:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/CalendarCallback

# Calendar IDs (will be set per user)
VITE_DEFAULT_CALENDAR_ID=primary
```

## 3. Testing with Dummy Accounts

### Test User Setup
1. **Boat Owner Account:**
   - Email: `test-owner@yourdomain.com`
   - Calendar: `test-owner@group.calendar.google.com`
   - Role: Boat owner with calendar integration

2. **Customer Account:**
   - Email: `test-customer@yourdomain.com`
   - Role: Booking customer

3. **Additional Test Users:**
   - `owner2@yourdomain.com`
   - `customer2@yourdomain.com`

## 4. Calendar Integration Features

### For Boat Owners:
- ✅ Connect personal Google Calendar
- ✅ View all bookings in calendar
- ✅ Receive booking notifications
- ✅ Block out unavailable times
- ✅ Sync with existing calendar events

### For Customers:
- ✅ See real-time availability
- ✅ Book available time slots
- ✅ Request custom times
- ✅ Receive booking confirmations

## 5. Implementation Steps

1. **Replace Mock Calendar Service** with real Google Calendar API
2. **Add OAuth Flow** for calendar connection
3. **Implement Calendar Event Creation** for bookings
4. **Add Availability Checking** against real calendar
5. **Set up Webhooks** for real-time updates

## 6. Testing Workflow

1. **Owner Setup:**
   - Login as boat owner
   - Connect Google Calendar
   - Verify calendar integration

2. **Customer Booking:**
   - Browse available boats
   - Check real availability
   - Make booking request

3. **Owner Approval:**
   - Receive booking notification
   - Review in calendar
   - Approve/reject booking

4. **Calendar Sync:**
   - Verify event creation
   - Check availability updates
   - Test notifications

## 7. Security Considerations

- Store OAuth tokens securely
- Implement token refresh logic
- Handle calendar permissions properly
- Validate calendar access before operations
- Implement proper error handling

## 8. Production Deployment

- Update redirect URIs for production domain
- Set up proper environment variables
- Configure webhook endpoints
- Implement rate limiting
- Add monitoring and logging 