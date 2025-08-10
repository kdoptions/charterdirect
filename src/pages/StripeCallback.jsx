
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import stripeConnect from '../components/api/stripeConnect';
import { Boat } from '../api/entities';

const StripeCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Connecting your Stripe account...');

  useEffect(() => {
    const handleStripeCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('🔗 Stripe Connect callback received:', { code, state, error, errorDescription });

        // Check for errors
        if (error) {
          console.error('❌ Stripe Connect error:', error, errorDescription);
          setStatus('error');
          setMessage(`Connection failed: ${errorDescription || error}`);
          return;
        }

        // Validate state parameter
        const storedState = localStorage.getItem('stripe_connect_state');
        const storedBoatId = localStorage.getItem('stripe_connect_boat_id');
        
        if (!storedState || state !== storedState) {
          console.error('❌ Invalid state parameter');
          setStatus('error');
          setMessage('Invalid connection request. Please try again.');
          return;
        }

        if (!code) {
          console.error('❌ No authorization code received');
          setStatus('error');
          setMessage('No authorization received from Stripe. Please try again.');
          return;
        }

        // Process the OAuth callback
        const redirectUri = `${window.location.origin}/stripe-callback`;
        const result = await stripeConnect.handleOAuthCallback(code, redirectUri);

        if (result.success) {
          console.log('✅ Stripe Connect successful:', result);
          
          // Store the connected account ID
          const connectedAccountId = result.connectedAccountId;
          
          // Update the boat with the Stripe account ID
          if (storedBoatId) {
            try {
              await Boat.update(storedBoatId, {
                stripe_account_id: connectedAccountId,
                stripe_connected: true,
                stripe_connected_at: new Date().toISOString()
              });
              
              console.log('✅ Boat updated with Stripe account ID:', connectedAccountId);
            } catch (updateError) {
              console.error('❌ Error updating boat:', updateError);
              // Don't fail the whole process if boat update fails
            }
          }

          // Clean up stored data
          localStorage.removeItem('stripe_connect_state');
          localStorage.removeItem('stripe_connect_boat_id');

          setStatus('success');
          setMessage('Stripe account connected successfully! You can now receive payments for your boat bookings.');
          
          // Redirect back to owner dashboard after a delay
          setTimeout(() => {
            navigate('/owner-dashboard');
          }, 3000);
        } else {
          console.error('❌ Stripe Connect failed:', result.error);
          setStatus('error');
          setMessage(`Connection failed: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ Error handling Stripe callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleStripeCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          )}
          {status === 'success' && (
            <div className="text-green-500 text-6xl mb-4">✅</div>
          )}
          {status === 'error' && (
            <div className="text-red-500 text-6xl mb-4">❌</div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'processing' && 'Connecting Stripe Account...'}
          {status === 'success' && 'Stripe Account Connected!'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              You'll be redirected to your dashboard in a few seconds...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/owner-dashboard')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripeCallback;
