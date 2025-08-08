
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { googleCalendar } from "../components/api/googleCalendar";
import { User } from "@/api/entities"; // Removed CalendarIntegration import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Calendar } from "lucide-react";

export default function CalendarCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  useEffect(() => {
    handleCallback();
  }, []);

  const addDebugLog = (message) => {
    console.log(`[Calendar Debug] ${message}`);
    setDebugInfo(prev => [...prev, message]);
  };

  const handleCallback = async () => {
    try {
      addDebugLog("Starting callback handler");
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const errorParam = urlParams.get('error');

      addDebugLog(`URL params - code: ${code ? 'present' : 'missing'}, error: ${errorParam || 'none'}`);

      if (errorParam) {
        setStatus("error");
        setError(`Authorization failed: ${errorParam}`);
        return;
      }

      if (!code) {
        setStatus("error");
        setError("No authorization code received");
        return;
      }

      addDebugLog("Exchanging code for tokens");
      // Exchange code for tokens
      const tokenResult = await googleCalendar.handleOAuthCallback(code);
      addDebugLog(`Token exchange result: ${tokenResult.success ? 'success' : 'failed'}`);
      
      if (!tokenResult.success) {
        setStatus("error");
        setError(tokenResult.error || "Failed to exchange authorization code for tokens.");
        return;
      }

      // Debug token data
      addDebugLog(`Access token: ${tokenResult.tokens.access_token ? 'present' : 'missing'}`);
      addDebugLog(`Refresh token: ${tokenResult.tokens.refresh_token ? 'present' : 'missing'}`);

      addDebugLog("Getting current user");
      // Get current user
      let user;
      try {
        user = await User.me();
        addDebugLog(`User retrieved: ${user ? user.id : 'null'}`);
      } catch (err) {
        addDebugLog(`User.me() failed: ${err.message}`);
        setStatus("error");
        setError("You must be logged in to connect your calendar. Please try logging in and then connecting the calendar again.");
        return;
      }

      if (!user || !user.id) {
        addDebugLog("User or user.id is missing");
        setStatus("error");
        setError("User session not found. Please log in again to connect your calendar.");
        return;
      }

      addDebugLog("Getting calendars from Google");
      const calendarsResult = await googleCalendar.getCalendarList(tokenResult.tokens.access_token);
      addDebugLog(`Calendars result: ${calendarsResult.success ? 'success' : 'failed'}`);
      
      if (!calendarsResult.success) {
        setStatus("error");
        setError(calendarsResult.error || "Failed to retrieve calendars from your Google account.");
        return;
      }

      addDebugLog(`Found ${calendarsResult.calendars?.length || 0} calendars`);

      const primaryCalendar = calendarsResult.calendars.find(cal => cal.id === 'primary') || calendarsResult.calendars[0];
      
      if (!primaryCalendar) {
        setStatus("error");
        setError("No usable calendars found in your Google account.");
        return;
      }

      // **FIX:** Use the 'summary' (email) as the ID for the primary calendar
      const calendarIdToSave = primaryCalendar.id === 'primary' ? primaryCalendar.summary : primaryCalendar.id;
      addDebugLog(`Calendar to save: ${calendarIdToSave}`);

      addDebugLog("Storing calendar data in user profile instead of separate entity");
      
      // Store calendar integration data directly in the user's profile
      const calendarData = {
        google_calendar_integration: {
          google_calendar_id: calendarIdToSave,
          access_token: tokenResult.tokens.access_token,
          refresh_token: tokenResult.tokens.refresh_token,
          sync_enabled: true,
          buffer_minutes: 60,
          connected_at: new Date().toISOString()
        }
      };

      addDebugLog(`Storing in user profile: ${JSON.stringify(calendarData)}`);

      try {
        await User.updateMyUserData(calendarData);
        addDebugLog("Successfully stored calendar data in user profile");
        setStatus("success");
      } catch (userUpdateError) {
        addDebugLog(`User update failed: ${userUpdateError.message}`);
        
        // Fallback: try to create a simple record without the CalendarIntegration entity
        addDebugLog("Attempting alternative storage method");
        try {
          // Create a simple text-based record of the integration
          const simpleIntegrationData = {
            calendar_integration_data: JSON.stringify({
              owner_id: user.id,
              google_calendar_id: calendarIdToSave,
              access_token: tokenResult.tokens.access_token,
              refresh_token: tokenResult.tokens.refresh_token,
              sync_enabled: true,
              buffer_minutes: 60,
              created_at: new Date().toISOString()
            })
          };
          
          await User.updateMyUserData(simpleIntegrationData);
          addDebugLog("Successfully stored as JSON string in user data");
          setStatus("success");
        } catch (fallbackError) {
          addDebugLog(`Fallback also failed: ${fallbackError.message}`);
          throw fallbackError; // Re-throw to be caught by the outer catch
        }
      }

    } catch (err) {
      addDebugLog(`Caught error: ${err.message}`);
      console.error("Calendar callback error:", err);
      // Fallback for any other unexpected error
      setStatus("error");
      setError(`Error: ${err.message}`);
    }
  };

  const goToDashboard = () => {
    navigate(createPageUrl("OwnerDashboard"));
  };

  const goHome = () => {
    navigate(createPageUrl("Home"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Google Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "processing" && (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-slate-600">Finalizing connection...</p>
            </div>
          )}
          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-xl font-semibold">Connection Successful!</h3>
              <p className="text-slate-600">Your Google Calendar is now connected.</p>
              <Button onClick={goToDashboard}>Go to Dashboard</Button>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="text-xl font-semibold">Connection Failed</h3>
              <p className="text-red-700 bg-red-50 p-3 rounded-md">{error}</p>
              
              {/* Debug information */}
              <details className="text-left text-xs bg-gray-100 p-2 rounded">
                <summary className="cursor-pointer font-semibold">Debug Information</summary>
                <div className="mt-2 space-y-1">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="text-gray-600">
                      {index + 1}. {info}
                    </div>
                  ))}
                </div>
              </details>
              
              <Button onClick={goToDashboard} variant="outline">
                Back to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
