import React, { useState, useEffect } from 'react';
import { googleBusinessProfileService } from '@/api/googleBusinessProfileService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  User,
  Building
} from 'lucide-react';

export default function OAuthReviewImport({ boat, onReviewsImported }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Check if user is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if we have stored tokens
        const storedToken = localStorage.getItem('google_business_access_token');
        if (storedToken) {
          setAccessToken(storedToken);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError('Authorization was denied. Please try again.');
      return;
    }

    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code) => {
    setIsConnecting(true);
    setError(null);

    try {
      const tokenData = await googleBusinessProfileService.exchangeCodeForTokens(code);
      
      if (tokenData.access_token) {
        setAccessToken(tokenData.access_token);
        setIsConnected(true);
        
        // Store token (in production, store securely on server)
        localStorage.setItem('google_business_access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('google_business_refresh_token', tokenData.refresh_token);
        }
        
        setSuccess('Successfully connected to Google Business Profile!');
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setError('Failed to connect to Google Business Profile. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToGoogle = () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      googleBusinessProfileService.initiateOAuth();
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      setError('Failed to start Google authorization. Please try again.');
      setIsConnecting(false);
    }
  };

  const importReviews = async () => {
    if (!accessToken) {
      setError('Not connected to Google Business Profile');
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await googleBusinessProfileService.importReviewsWithOAuth(boat.id, accessToken);
      
      setSuccess({
        message: `Successfully imported ${result.importedCount} reviews from ${result.profileName}!`,
        details: result
      });

      if (onReviewsImported) {
        onReviewsImported(result);
      }

    } catch (error) {
      console.error('Import error:', error);
      setError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('google_business_access_token');
    localStorage.removeItem('google_business_refresh_token');
    setAccessToken(null);
    setIsConnected(false);
    setSuccess('Disconnected from Google Business Profile');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-500" />
            <span>Google Business Profile (OAuth)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Connect your Google Business Profile to import reviews automatically. 
            This works just like Google Calendar - just login and authorize!
          </p>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">Connected to Google Business Profile</span>
                <Badge variant="outline" className="text-xs">
                  OAuth
                </Badge>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700">Not connected</span>
              </>
            )}
          </div>

          {/* Connection Actions */}
          {!isConnected ? (
            <Button 
              onClick={connectToGoogle}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect Google Business Profile
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={importReviews}
                disabled={isImporting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing Reviews...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Import Reviews from Business Profile
                  </>
                )}
              </Button>
              
              <Button 
                onClick={disconnect}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {typeof success === 'string' ? success : success.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">How OAuth works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Connect Google Business Profile"</li>
              <li>• Login to your Google account</li>
              <li>• Grant permission to access your business data</li>
              <li>• Import reviews automatically</li>
              <li>• No API keys needed!</li>
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Requirements:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• You must own a Google Business Profile</li>
              <li>• Your business must have reviews on Google</li>
              <li>• You need to be the owner/manager of the business</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

