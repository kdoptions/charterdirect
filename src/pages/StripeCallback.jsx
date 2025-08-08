
import React, { useEffect, useState } from "react";
import { Boat, User } from "@/api/entities";
import { stripeConnect } from "../components/api/stripeConnect";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function StripeCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Stripe connection was cancelled or failed.');
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Invalid callback parameters.');
        return;
      }

      // Handle the OAuth callback
      const result = await stripeConnect.handleOAuthCallback(code, state);
      
      if (result.success) {
        // Update user's boats with the connected Stripe account
        const user = await User.me();
        const userBoats = await Boat.filter({ owner_id: user.id });
        
        // Update the first boat without a Stripe account, or the most recent one
        const boatToUpdate = userBoats.find(b => !b.stripe_account_id) || userBoats[0];
        
        if (boatToUpdate) {
          await Boat.update(boatToUpdate.id, { 
            stripe_account_id: result.accountId 
          });
        }

        setStatus('success');
        setMessage('Successfully connected your Stripe account! You can now receive payments.');
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to connect Stripe account.');
      }
    } catch (error) {
      console.error('Stripe callback error:', error);
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-2xl shadow-lg">
        {status === 'processing' && (
          <>
            <Loader2 className="mx-auto h-16 w-16 text-blue-600 animate-spin mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Connecting Stripe...</h1>
            <p className="text-slate-600">Please wait while we set up your payment account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Connection Successful!</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(createPageUrl("OwnerDashboard"))}
                className="w-full luxury-gradient text-white"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => navigate(createPageUrl("MyBoats"))}
                variant="outline" 
                className="w-full"
              >
                View My Boats
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Connection Failed</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(createPageUrl("OwnerDashboard"))}
                className="w-full luxury-gradient text-white"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline" 
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
