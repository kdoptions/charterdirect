# Google Calendar Integration Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to exchange code for tokens" Error

This error typically occurs due to one of these issues:

#### Missing Environment Variables
**Problem**: `VITE_GOOGLE_CLIENT_ID` or `VITE_GOOGLE_CLIENT_SECRET` are not set.

**Solution**: 
1. Create a `.env` file in your project root (copy from `env.example`)
2. Add your actual Google OAuth credentials:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
   VITE_GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5174/CalendarCallback
   ```
3. Restart your development server

#### Redirect URI Mismatch
**Problem**: The redirect URI in your Google Cloud Console doesn't match the one in your app.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add these exact redirect URIs:
   - `https://yourdomain.com/CalendarCallback` (production - primary)
   - `http://localhost:5174/CalendarCallback` (development - optional)
5. Save changes

#### Invalid Authorization Code
**Problem**: The authorization code has expired or is invalid.

**Solution**:
1. Clear your browser cache and cookies
2. Try the connection process again
3. Make sure you're using the code immediately after receiving it

### 2. "Missing Google OAuth credentials" Error

**Problem**: Environment variables are not being loaded properly.

**Solution**:
1. Verify your `.env` file exists and has the correct format
2. Make sure variable names start with `VITE_`
3. Restart your development server after making changes
4. Check browser console for environment variable values

### 3. "Google API not loaded" Error

**Problem**: The Google API script hasn't loaded properly.

**Solution**:
1. Check your internet connection
2. Verify the Google API script is loading in your HTML
3. Check browser console for any script loading errors

## Debugging Steps

### Step 1: Check Environment Variables
Open browser console and look for these debug messages:
```
🔍 Debug: getAuthUrl called
🔍 Debug: this.redirectUri = http://localhost:5174/CalendarCallback
🔍 Debug: this.clientId = present/missing
🔍 Debug: this.clientSecret = present/missing
```

### Step 2: Verify Google Cloud Console Settings
1. **OAuth Consent Screen**:
   - App name: "Harbour Lux"
   - User support email: your email
   - Scopes: `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events`

2. **OAuth 2.0 Credentials**:
   - Application type: Web application
   - Authorized redirect URIs: Must match exactly with your app

### Step 3: Test OAuth Flow
1. Clear browser cache and cookies
2. Try connecting calendar again
3. Watch browser console for detailed error messages
4. Check Network tab for failed requests

## Environment Variables Checklist

Make sure your `.env` file contains:

```env
# Required for Google Calendar
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/CalendarCallback

# Optional for local development
VITE_LOCAL_GOOGLE_REDIRECT_URI=http://localhost:5174/CalendarCallback
VITE_DEBUG_MODE=true
```

## Production Deployment

When deploying to production:

1. **Update redirect URIs** in Google Cloud Console
2. **Set production environment variables** in your hosting platform
3. **Verify HTTPS** - Google OAuth requires HTTPS in production
4. **Test the full flow** in production environment

## Getting Help

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Google Cloud Console settings match your app configuration
4. Test with a fresh browser session (incognito/private mode)

## Common Environment Variable Issues

- **Missing VITE_ prefix**: Vite only loads variables starting with `VITE_`
- **Wrong file name**: Must be `.env` (not `.env.local` or `.env.example`)
- **File location**: Must be in project root directory
- **Server restart**: Changes require development server restart
