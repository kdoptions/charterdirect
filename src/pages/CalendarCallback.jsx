
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import realGoogleCalendarService from "@/api/realGoogleCalendarService";
import { User } from "@/api/entities";
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
      // Get current user - use demo owner for testing
      let user;
      try {
        user = await User.me();
        if (!user) {
          addDebugLog("No user session, using demo owner");
          user = await User.loginAsOwner();
        }
        addDebugLog(`User retrieved: ${user ? user.id : 'null'}`);
      } catch (err) {
        addDebugLog(`User.me() failed: ${err.message}`);
        addDebugLog("Falling back to demo owner");
        user = await User.loginAsOwner();
      }

      if (!user || !user.id) {
        addDebugLog("User or user.id is missing");
        setStatus("error");
        setError("User session not found. Please log in again to connect your calendar.");
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

      // Store tokens in localStorage like CalendarConnection component expects
      const userId = user?.id || 'test-owner-1';
      const tokenData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type
      };
      
      localStorage.setItem(`google_tokens_${userId}`, JSON.stringify(tokenData));
      localStorage.setItem(`selected_calendar_${userId}`, primaryCalendar.id);
      
      addDebugLog(`Stored tokens in localStorage for user: ${userId}`);
      addDebugLog(`Selected calendar: ${primaryCalendar.id}`);
      
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
