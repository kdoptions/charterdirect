
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import realGoogleCalendarService from "@/api/realGoogleCalendarService";
import { User } from "@/api/entities";
import { supabase } from "@/lib/supabase";
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
      // Exchange code for tokens using real Google Calendar service
      const tokens = await realGoogleCalendarService.exchangeCodeForTokens(code);
      addDebugLog(`Token exchange successful`);
      
      // Debug token data
      addDebugLog(`Access token: ${tokens.access_token ? 'present' : 'missing'}`);
      addDebugLog(`Refresh token: ${tokens.refresh_token ? 'present' : 'missing'}`);

      addDebugLog("Getting current user");
      // Get current user - must be a real authenticated user
      let user;
      try {
        user = await User.me();
        if (!user) {
          addDebugLog("No user session found");
          setStatus("error");
          setError("You must be logged in to connect your Google Calendar. Please log in and try again.");
          return;
        }
        addDebugLog(`User retrieved: ${user ? user.id : 'null'}`);
      } catch (err) {
        addDebugLog(`User.me() failed: ${err.message}`);
        setStatus("error");
        setError("Failed to get user session. Please log in and try again.");
        return;
      }

      if (!user || !user.id) {
        addDebugLog("User or user.id is missing");
        setStatus("error");
        setError("User session not found. Please log in again to connect your calendar.");
        return;
      }

      // Verify user ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        addDebugLog(`Invalid user ID format: ${user.id}`);
        setStatus("error");
        setError("Invalid user session. Please log in again.");
        return;
      }

      addDebugLog("Getting calendars from Google");
      const calendars = await realGoogleCalendarService.getUserCalendars(tokens.access_token);
      addDebugLog(`Found ${calendars?.length || 0} calendars`);

      const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];
      
      if (!primaryCalendar) {
        setStatus("error");
        setError("No usable calendars found in your Google account.");
        return;
      }

      // Store refresh token and calendar ID in Supabase database
      const userId = user?.id;
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Double-check that we have a valid UUID
      if (!uuidRegex.test(userId)) {
        throw new Error('Invalid user ID format. Please log in again.');
      }

      addDebugLog(`User ID: ${userId}`);
      addDebugLog(`Selected calendar: ${primaryCalendar.id}`);
      addDebugLog(`Storing refresh token in database for user: ${userId}`);

      // Update user record in Supabase with Google Calendar integration
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({
          google_refresh_token: tokens.refresh_token,
          google_calendar_id: primaryCalendar.id,
          google_integration_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();

      if (updateError) {
        console.error('Failed to update user with Google Calendar integration:', updateError);
        throw new Error(`Failed to save calendar integration: ${updateError.message}`);
      }

      addDebugLog(`✅ Successfully stored Google Calendar integration in database`);
      addDebugLog(`Updated user record:`, updateData);
      
      setStatus("success");

    } catch (err) {
      addDebugLog(`Caught error: ${err.message}`);
      console.error("Calendar callback error:", err);
      // Fallback for any other unexpected error
      setStatus("error");
      setError(`Error: ${err.message}`);
    }
  };

  const goToDashboard = () => {
    navigate("/owner-dashboard");
  };

  const goHome = () => {
    navigate("/");
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
