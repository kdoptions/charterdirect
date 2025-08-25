
import React, { useState, useEffect } from "react";
import { Boat, Booking } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import stripeConnect from '../components/api/stripeConnect';
import realGoogleCalendarService from "@/api/realGoogleCalendarService";
import StripeService from '../api/stripeService';
import { notifications } from "../components/api/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ship, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Settings,
  CreditCard,
  Bell,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";


export default function OwnerDashboard() {
  const { currentUser } = useAuth();
  const [boats, setBoats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', booking: null });
  const [stripeConnected, setStripeConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [selectedConnectedAccount, setSelectedConnectedAccount] = useState(null);
  const [userCalendarData, setUserCalendarData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadOwnerData().catch(err => {
        console.error("❌ Error in loadOwnerData:", err);
        setError(err.message);
      });
    }
  }, [currentUser]);

  // Check calendar connection status on mount and when returning from calendar callback
  useEffect(() => {
    if (currentUser) {
      checkCalendarConnectionStatus();
    }
  }, [currentUser]);

  // Function to check calendar connection status
  const checkCalendarConnectionStatus = () => {
    const hasCalendar = currentUser?.google_integration_active || false;
    
    console.log('🔍 Checking calendar connection status:', {
      currentUserId: currentUser?.id,
      googleIntegrationActive: currentUser?.google_integration_active,
      isConnected: hasCalendar
    });
    
    setCalendarConnected(hasCalendar);
  };

  // Debug: Log whenever bookings state changes
  useEffect(() => {
    console.log("🔍 OwnerDashboard bookings state changed:", bookings);
  }, [bookings]);

  const loadOwnerData = async () => {
    try {
      if (!currentUser) {
        console.log("No user logged in");
        setError("You must be logged in to access the owner dashboard");
        setLoading(false);
        return;
      }

      console.log("Loading owner data for user:", currentUser);
      
      // Load boats owned by current user
      console.log("Loading boats for owner ID:", currentUser.id);
      console.log("Current user object:", currentUser);
      
      let userBoats = [];
      try {
        userBoats = await Boat.filter({ owner_id: currentUser.id });
        console.log("User boats found:", userBoats);
        console.log("User boats length:", userBoats?.length);
        setBoats(userBoats);
      } catch (boatError) {
        console.error("Error loading boats:", boatError);
        setBoats([]);
      }

      // Load bookings for user's boats
      try {
        const allBookings = await Booking.filter({}); // Pass empty object to get all real bookings
        console.log("All bookings loaded:", allBookings);
        console.log("All bookings length:", allBookings?.length);
        
        const boatIds = userBoats?.map(boat => boat.id) || [];
        console.log("Owner boat IDs:", boatIds);
        console.log("Owner boat IDs length:", boatIds.length);
        
        // Debug each booking to see why it's not matching
        if (allBookings && allBookings.length > 0) {
          allBookings.forEach(booking => {
            console.log(`Booking ${booking.id}: boat_id=${booking.boat_id}, matches=${boatIds.includes(booking.boat_id)}`);
          });
        }
        
        const ownerBookings = allBookings?.filter(booking => boatIds.includes(booking.boat_id)) || [];
        console.log("Owner bookings filtered:", ownerBookings);
        console.log("Owner bookings length:", ownerBookings.length);
        setBookings(ownerBookings);
      } catch (bookingError) {
        console.error("Error loading bookings:", bookingError);
        setBookings([]);
      }

      // Check integration status from user data instead of separate entity
      const hasStripe = userBoats.some(boat => boat.stripe_account_id);
      
      // Check calendar integration from database
      let hasCalendar = false;
      let userCalendarData = null;
      
      // Always fetch user data from database to ensure it's fresh
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('google_integration_active, google_calendar_id, google_refresh_token')
          .eq('id', currentUser?.id)
          .single();
        
        if (!error && userData) {
          hasCalendar = userData.google_integration_active || false;
          userCalendarData = userData;
          console.log('🔍 Fetched Google Calendar status from database:', userData);
          setUserCalendarData(userData); // Update local state
        }
      } catch (dbError) {
        console.error('Error fetching Google Calendar status:', dbError);
      }
      
      console.log('🔍 Calendar Integration Debug:', {
        currentUserId: currentUser?.id,
        googleIntegrationActive: userCalendarData?.google_integration_active,
        hasCalendar: hasCalendar,
        userCalendarData: userCalendarData
      });
      
      setStripeConnected(hasStripe);
      setCalendarConnected(hasCalendar);

    } catch (error) {
      console.error("❌ Error loading owner data:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      console.log('🔗 Connecting Stripe account...');
      
      // Check if user has boats
      if (!boats || boats.length === 0) {
        alert('You need to have at least one boat listed before connecting Stripe.');
        return;
      }
      
      // Use the first boat for now, or could prompt user to select one
      const selectedBoat = boats[0];
      console.log('🔗 Using boat for Stripe connection:', selectedBoat.name);
      
      // Initialize Stripe service
      const stripeService = new StripeService();
      
      // Step 1: Create Stripe Connect account
      console.log('🔗 Step 1: Creating Stripe Connect account...');
      const accountResult = await stripeService.createConnectAccount(selectedBoat, currentUser);
      
      if (!accountResult.success) {
        throw new Error(accountResult.error || 'Failed to create Stripe Connect account');
      }
      
      const account = accountResult.account;
      console.log('✅ Stripe Connect account created:', account.id);
      
      // Step 2: Create account link for onboarding
      console.log('🔗 Step 2: Creating account link for onboarding...');
      const refreshUrl = `${window.location.origin}/owner-dashboard`;
      const returnUrl = `${window.location.origin}/owner-dashboard?stripe_connected=true`;
      
      const linkResult = await stripeService.createAccountLink(account.id, refreshUrl, returnUrl);
      
      if (!linkResult.success) {
        throw new Error(linkResult.error || 'Failed to create account link');
      }
      
      const accountLink = linkResult.url;
      console.log('✅ Account link created:', accountLink);
      
      // Step 3: Update boat with connected account ID
      console.log('🔗 Step 3: Updating boat with connected account...');
      await Boat.update(selectedBoat.id, {
        stripe_account_id: account.id
      });
      
      // Step 4: Update local state
      setSelectedConnectedAccount(account.id);
      setStripeConnected(true);
      
      // Step 5: Redirect user to Stripe onboarding
      console.log('🔗 Step 5: Redirecting to Stripe onboarding...');
      alert(`✅ Stripe Connect account created successfully!\n\nRedirecting you to Stripe to complete your account setup...`);
      
      // Open Stripe onboarding in new tab
      window.open(accountLink, '_blank');
      
      console.log('✅ Stripe Connect flow completed successfully');
      
    } catch (error) {
      console.error('❌ Stripe Connect error:', error);
      alert('Failed to connect Stripe account. Please try again.');
    }
  };

  // Quick test function to set a connected account for development
  const setTestConnectedAccount = () => {
    // Create a test connected account ID for development
    const testAccount = `acct_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSelectedConnectedAccount(testAccount);
    alert(`✅ Test connected account set: ${testAccount}\n\nNow you can test booking approvals!\n\nThis is a test account for development - no real money will move!`);
  };

  const handleCalendarConnect = async () => {
    try {
      const authUrl = realGoogleCalendarService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Calendar connect error:", error);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      console.log(`🔄 Processing booking ${action}:`, bookingId);
      console.log('🔍 Function parameters:', { bookingId, action });
      console.log('🔍 Available bookings:', bookings);
      console.log('🔍 Available boats:', boats);
      
      // Get booking and boat data early so it's available throughout the function
      const booking = getBookingById(bookingId);
      const boat = getBoatById(booking.boat_id);
      
      console.log('🔍 Found booking:', booking);
      console.log('🔍 Found boat:', boat);
      
      if (!booking || !boat) {
        alert('Booking or boat not found.');
        return;
      }
      
      if (action === 'confirmed') {
        // Check if we have a connected account selected
        if (!selectedConnectedAccount) {
          alert('Please select a connected account first to receive payments.');
          return;
        }

        console.log('💰 Processing payment for booking:', {
          booking,
          boat,
          connectedAccount: selectedConnectedAccount
        });

        // Check if payment is pending approval
        if (booking.payment_status === 'pending_approval' && booking.stripe_payment_intent_id) {
          console.log('💳 Payment pending approval, processing payment now...');
          
          try {
            // Confirm the PaymentIntent to charge the customer
            const stripeService = new StripeService();
            await stripeService.initialize();
            
            // Confirm the PaymentIntent
            const confirmResult = await stripeService.confirmPaymentIntent(booking.stripe_payment_intent_id);
            
            if (confirmResult.success) {
              console.log('✅ Payment confirmed successfully:', confirmResult.paymentIntent);
              
              // Update booking status to confirmed and mark payment as completed
              await Booking.update(bookingId, {
                status: 'confirmed',
                payment_status: 'deposit_paid',
                deposit_paid_at: new Date().toISOString(),
                platform_fee_collected: booking.platform_fee || 0
              });
              
              console.log('✅ Booking confirmed and payment processed');
            } else {
              throw new Error(confirmResult.error || 'Payment confirmation failed');
            }
          } catch (paymentError) {
            console.error('❌ Payment confirmation failed:', paymentError);
            
            // Update booking with payment failure
            await Booking.update(bookingId, {
              payment_status: 'failed',
              payment_error: paymentError.message,
              payment_failed_at: new Date().toISOString()
            });
            
            // Show error to owner and set grace period
            const gracePeriodEnd = new Date();
            gracePeriodEnd.setHours(gracePeriodEnd.getHours() + 24);
            
            await Booking.update(bookingId, {
              payment_grace_period_until: gracePeriodEnd.toISOString()
            });
            
            alert(`❌ Payment failed: ${paymentError.message}\n\nCustomer has 24 hours to update their payment method.\nGrace period ends: ${gracePeriodEnd.toLocaleString()}`);
            return;
          }
        } else if (booking.payment_status === 'deposit_paid') {
          console.log('✅ Deposit already paid, proceeding with confirmation');
          
          // Update booking status to confirmed
          await Booking.update(bookingId, {
            status: 'confirmed'
          });
          
          // Create Google Calendar event for boat owner's calendar only (not for customer)
          if (userCalendarData?.google_integration_active) {
            console.log('📅 Calendar integration enabled, creating event for booking:', booking.id);
            console.log('📅 User calendar data:', userCalendarData);
            
            try {
              // Get fresh access token using refresh token from database
              console.log('📅 Getting fresh access token...');
              const freshTokenData = await realGoogleCalendarService.getFreshAccessToken(userCalendarData.google_refresh_token);
              console.log('📅 Fresh token data:', freshTokenData);
              
              // Get the appropriate calendar ID for this boat
              const boat = boats.find(b => b.id === booking.boat_id);
              const calendarId = realGoogleCalendarService.getBoatCalendarId(boat, userCalendarData);
              console.log('📅 Using calendar ID:', calendarId);
              
              // Construct ISO-compatible date strings
              const bookingDate = new Date(booking.start_date);
              const startDateString = bookingDate.toISOString().split('T')[0];
              
              // Convert time strings to full ISO format
              console.log('📅 Raw time values:', { 
                start_time: booking.start_time, 
                end_time: booking.end_time,
                startDateString 
              });
              
              // Ensure time format is correct (HH:MM:SS)
              const startTime = booking.start_time.includes(':00') ? booking.start_time : `${booking.start_time}:00`;
              const endTime = booking.end_time.includes(':00') ? booking.end_time : `${booking.end_time}:00`;
              
              const startTimeISO = `${startDateString}T${startTime}`;
              const endTimeISO = `${startDateString}T${endTime}`;
              
              console.log('📅 Event time data:', { startTimeISO, endTimeISO });
              
              // Create event data with correct field names and null checks
              const eventData = {
                customer_name: booking.customer_name || 'Unknown Customer',
                guests: booking.guests || 1,
                customer_email: booking.customer_email || 'no-email@example.com',
                customer_phone: booking.customer_phone || 'No phone provided',
                start_datetime: startTimeISO,
                end_datetime: endTimeISO,
                special_requests: booking.special_requests || 'None'
              };
              
              console.log('📅 Creating calendar event with data:', eventData);
              
              const result = await realGoogleCalendarService.createBookingEvent(
                calendarId, 
                eventData, 
                freshTokenData.access_token
              );
              
              console.log('📅 Calendar event creation result:', result);
              
              if (result.success) {
                console.log("✅ Successfully created Google Calendar event for boat owner:", result.eventId);
                
                // Store Google Calendar event ID in booking record
                await Booking.update(booking.id, {
                  google_calendar_event_id: result.eventId
                });
              } else {
                console.error('❌ Calendar event creation failed:', result.error);
              }
            } catch (calendarError) {
              console.error('❌ Calendar event creation error:', calendarError);
              console.error('❌ Error details:', {
                message: calendarError.message,
                stack: calendarError.stack,
                userCalendarData: userCalendarData
              });
            }
          } else {
            console.log('📅 Calendar integration not enabled or missing data:', {
              google_integration_active: userCalendarData?.google_integration_active,
              userCalendarData: userCalendarData
            });
          }
          
          // Send confirmation email to customer
          try {
            await notifications.notifyCustomerBookingConfirmed(booking.customer_email, {
              customerName: booking.customer_name,
              boatName: boats.find(b => b.id === booking.boat_id)?.name,
              startDate: booking.start_date,
              startTime: booking.start_time,
              endTime: booking.end_time,
              guests: booking.guests,
              totalAmount: booking.total_amount,
              bookingId: booking.id
            });
            console.log("📧 Confirmation email sent to customer:", booking.customer_email);
          } catch (emailError) {
            console.warn("⚠️ Failed to send confirmation email:", emailError);
          }
          
          // Close the action dialog automatically
          setActionDialog({ open: false, type: '', booking: null });
          
          // Show success message and refresh data
          alert('✅ Booking confirmed successfully! Deposit was already paid. Confirmation email sent to customer.');
          await loadOwnerData();
          return;
        }
        
        // If deposit not paid and no PaymentIntent exists, this is an error
        console.error('❌ Cannot process payment: No PaymentIntent found for this booking');
        alert('❌ Cannot process payment: This booking was created before the new payment system. Please contact support.');
        return;

      } else if (action === 'rejected') {
        // Reject the booking and cancel any pending payments
        const reason = prompt('Please provide a reason for rejection:') || 'No reason provided';
        
        try {
          // Cancel PaymentIntent if payment is pending
          if (booking.payment_status === 'pending_approval' && booking.stripe_payment_intent_id) {
            console.log('💳 Cancelling PaymentIntent for rejected booking...');
            
            const stripeService = new StripeService();
            await stripeService.initialize();
            
            // Cancel the PaymentIntent
            const cancelResult = await stripeService.cancelPaymentIntent(booking.stripe_payment_intent_id);
            
            if (cancelResult.success) {
              console.log('✅ PaymentIntent cancelled successfully');
            } else {
              console.warn('⚠️ Failed to cancel PaymentIntent:', cancelResult.error);
            }
          }
          
          // Reject the booking
          await Booking.reject(bookingId, reason);
          
          // Close the action dialog
          setActionDialog({ open: false, type: '', booking: null });
          
          // Show success message
          alert('❌ Booking rejected successfully. No payment was charged.');
          
          // Refresh data
          await loadOwnerData();
          
        } catch (error) {
          console.error('❌ Error rejecting booking:', error);
          alert('Failed to reject booking. Please try again.');
        }
      } else {
        // Other actions
        const updateData = { status: action };
        await Booking.update(bookingId, updateData);
      }

      // Send notifications and create calendar event
      if (action === 'confirmed') {
        // Send email notification
        await notifications.notifyCustomerBookingConfirmed(booking.customer_email, {
          customerName: booking.customer_name,
          boatName: boats.find(b => b.id === booking.boat_id)?.name,
          startDate: booking.start_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          guests: booking.guests,
          totalAmount: booking.total_amount,
          bookingId: booking.id
        });

        // Create Google Calendar event if integration exists
        console.log("Checking for calendar integration...");
        
        if (userCalendarData?.google_integration_active && userCalendarData?.google_calendar_id) {
          console.log("✅ Calendar integration found, attempting to create event...");
          console.log("🔍 Calendar integration details:", {
            isActive: userCalendarData.google_integration_active,
            calendarId: userCalendarData.google_calendar_id,
            hasRefreshToken: !!userCalendarData.google_refresh_token
          });
          try {
            // Get fresh access token using refresh token from database
            const freshTokenData = await realGoogleCalendarService.getFreshAccessToken(userCalendarData.google_refresh_token);
            
            // Construct ISO-compatible date strings
            const bookingDate = new Date(booking.start_date);
            const startDateString = bookingDate.toISOString().split('T')[0];
            
            // Convert time strings to full ISO format
            const startTimeISO = `${startDateString}T${booking.start_time}:00`;
            const endTimeISO = `${startDateString}T${booking.end_time}:00`;
            
            // Create event data with correct field names and null checks
            const eventData = {
              customer_name: booking.customer_name || 'Unknown Customer',
              guests: booking.guests || 1,
              customer_email: booking.customer_email || 'no-email@example.com',
              customer_phone: booking.customer_phone || 'No phone provided',
              start_datetime: startTimeISO,
              end_datetime: endTimeISO,
              special_requests: booking.special_requests || 'None'
            };
            
            // Validate required fields before proceeding
            if (!startTimeISO || !endTimeISO) {
              console.error("❌ Invalid date/time data:", { startTimeISO, endTimeISO });
              throw new Error("Invalid booking date/time data");
            }
            
            console.log("Creating event with data:", eventData);
            console.log("Event data validation:", {
              hasCustomerName: !!eventData.customer_name,
              hasGuests: !!eventData.guests,
              hasEmail: !!eventData.customer_email,
              hasStartTime: !!eventData.start_datetime,
              hasEndTime: !!eventData.end_datetime
            });

            const result = await realGoogleCalendarService.createBookingEvent(
              userCalendarData.google_calendar_id, 
              eventData, 
              freshTokenData.access_token
            );
            
            if (result.success) {
              console.log("✅ Successfully created Google Calendar event:", result.eventId);
              console.log("📅 Event link:", result.eventLink);
              
              // Store Google Calendar event ID in booking record
              await Booking.update(booking.id, {
                google_calendar_event_id: result.eventId
              });
              
              console.log("🔒 Time slot is now marked as unavailable");
            } else {
              console.error("Failed to create calendar event:", result.error);
            }
            
          } catch (calendarError) {
            console.error("❌ Failed to create Google Calendar event:", calendarError);
            console.error("❌ Calendar error details:", {
              error: calendarError.message,
              stack: calendarError.stack,
              bookingData: {
                id: booking.id,
                customer_name: booking.customer_name,
                start_date: booking.start_date,
                start_time: booking.start_time,
                end_time: booking.end_time
              }
            });
          }
        } else {
          console.log("No calendar integration found");
        }
      }

      // Reload data
      await loadOwnerData();
      setActionDialog({ open: false, type: '', booking: null });
    } catch (error) {
      console.error("Booking action error:", error);
    }
  };

  // Calculate booking statistics
  const pendingApprovalBookings = bookings.filter(b => b.status === 'pending_approval');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  
  console.log("Booking breakdown:");
  console.log("- Total bookings:", bookings.length);
  console.log("- Pending approval:", pendingApprovalBookings.length);
  console.log("- Confirmed:", confirmedBookings.length);
  console.log("- Pending:", pendingBookings.length);
  
  const totalEarnings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_amount - b.commission_amount), 0);

  const getBoatById = (boatId) => boats.find(boat => boat.id === boatId);
  const getBookingById = (bookingId) => bookings.find(b => b.id === bookingId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-900">Error Loading Dashboard</h2>
          <p className="text-red-700">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Owner Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage your boats and bookings</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadOwnerData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                const { Booking, Boat } = await import('@/api/entities');
                const allBookings = await Booking.filter();
                const userBoats = await Boat.filter({ owner_id: currentUser?.id }); // Use currentUser from AuthContext
                console.log('🔍 Owner Dashboard Debug:');
                console.log('User ID:', currentUser?.id);
                console.log('User boats:', userBoats);
                console.log('All bookings:', allBookings);
                alert(`Debug info logged. User has ${userBoats.length} boats and ${allBookings.length} total bookings.`);
              }}
              className="flex items-center gap-2"
            >
              🔍 Debug
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log('🧪 Testing Calendar Integration...');
                const userId = currentUser?.id || 'test-owner-1'; // Use currentUser from AuthContext
                const tokens = localStorage.getItem(`google_tokens_${userId}`);
                const selectedCalendar = localStorage.getItem(`selected_calendar_${userId}`);
                
                console.log('Tokens:', tokens ? 'present' : 'missing');
                console.log('Selected calendar:', selectedCalendar);
                
                if (tokens && selectedCalendar) {
                  const tokenData = JSON.parse(tokens);
                  const testEvent = {
                    customer_name: 'Test Customer',
                    guests: 4,
                    customer_email: 'test@example.com',
                    customer_phone: '+1234567890',
                    start_datetime: new Date().toISOString(),
                    end_datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
                    special_requests: 'This is a test event from Harbour Lux'
                  };
                  
                  try {
                    console.log('Creating test event with data:', testEvent);
                    const result = await realGoogleCalendarService.createBookingEvent(selectedCalendar, testEvent, tokenData.access_token);
                    console.log('Test event result:', result);
                    alert(result.success ? 'Test event created successfully! Check your Google Calendar.' : 'Failed to create test event');
                  } catch (error) {
                    console.error('Test event error:', error);
                    alert('Error creating test event: ' + error.message);
                  }
                } else {
                  alert('No calendar integration found. Please connect Google Calendar first.');
                }
              }}
              className="flex items-center gap-2"
            >
              🧪 Test Calendar
            </Button>
          </div>
        </div>

        {/* Stripe Connection Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💳 Payment Processing
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">Connected Accounts Available</span>
            </div>
            <p className="text-sm text-gray-600">
              You have access to test connected accounts. Select one to receive payments.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Connected Account:</label>
              <select 
                value={selectedConnectedAccount || ''} 
                onChange={(e) => setSelectedConnectedAccount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose an account...</option>
                <option value={import.meta.env.VITE_STRIPE_CONNECTED_ACCOUNT_1}>
                  Account 1: {import.meta.env.VITE_STRIPE_CONNECTED_ACCOUNT_1 || 'Not configured'}
                </option>
                <option value={import.meta.env.VITE_STRIPE_CONNECTED_ACCOUNT_2}>
                  Account 2: {import.meta.env.VITE_STRIPE_CONNECTED_ACCOUNT_2 || 'Not configured'}
                </option>
              </select>
              
              {/* Quick test button for development */}
              <Button 
                onClick={setTestConnectedAccount} 
                size="sm" 
                variant="outline"
                className="w-full"
              >
                🧪 Set Test Connected Account
              </Button>
            </div>

            {selectedConnectedAccount && (
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-800">
                  ✅ Selected: {selectedConnectedAccount}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Payments will be routed to this account with automatic 10% platform fee collection.
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600">
              When customers book your boats, payments go directly to your connected account with our 10% platform fee automatically deducted.
            </p>
          </div>
        </div>

        {/* Payment Schedule Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📅 Payment Schedule Settings
          </h3>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balance Payment Due (Days Before Cruise)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="7"
                  defaultValue="7"
                />
                <p className="text-xs text-gray-500 mt-1">
                  When the remaining balance payment is due
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Schedule Status
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="payment_schedule_enabled"
                    defaultChecked={true}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="payment_schedule_enabled" className="text-sm text-gray-700">
                    Enable automatic balance payment requests
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Stripe will automatically send payment requests for remaining balances
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">How It Works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Deposit:</strong> Charged immediately when you approve booking</li>
                <li>• <strong>Platform Fee:</strong> 10% collected from deposit payment</li>
                <li>• <strong>Balance Payment:</strong> Automatically requested X days before cruise</li>
                <li>• <strong>Customer Experience:</strong> Receives email with payment link</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integration Alerts */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* TEST BUTTON - Should appear after deployment */}
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>🎯 FINAL TEST: Latest Code - {new Date().toLocaleTimeString()}</span>
              <Button onClick={setTestConnectedAccount} size="sm">
                Set Test Account
              </Button>
            </AlertDescription>
          </Alert>
          
          {!stripeConnected && (
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>Connect Stripe to receive payments</span>
                <Button onClick={handleStripeConnect} size="sm">
                  Connect Stripe
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {!calendarConnected && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>Connect Google Calendar for availability sync</span>
                <Button onClick={handleCalendarConnect} size="sm">
                  Connect Calendar
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Debug Data Display */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">🔍 Debug Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>User ID:</strong> {currentUser?.id || 'Not loaded'}
              </div>
              <div>
                <strong>Boats:</strong> {boats.length} found
              </div>
              <div>
                <strong>Bookings:</strong> {bookings.length} found
              </div>
            </div>
            {boats.length > 0 && (
              <div className="mt-4">
                <strong>Boat IDs:</strong> {boats.map(b => b.id).join(', ')}
              </div>
            )}
            {bookings.length > 0 && (
              <div className="mt-4">
                <strong>Booking IDs:</strong> {bookings.map(b => `${b.id} (boat: ${b.boat_id})`).join(', ')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Calendar Integration Status */}
        {calendarConnected && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Google Calendar Integration
                </CardTitle>
                <Button 
                  onClick={checkCalendarConnectionStatus} 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Status
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">Connected</p>
                  <p className="text-sm text-green-600">Calendar sync active</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Bell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-800">Notifications</p>
                  <p className="text-sm text-blue-600">Email & popup alerts</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <ExternalLink className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-purple-800">Auto-Sync</p>
                  <p className="text-sm text-purple-600">Bookings sync automatically</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>How it works:</strong> When customers book your boats, events are automatically created in your Google Calendar 
                  with notifications. You'll receive email and popup reminders before each booking.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Boats</p>
                  <p className="text-2xl font-bold text-slate-900">{boats.length}</p>
                </div>
                <Ship className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingApprovalBookings.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{confirmedBookings.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">
              Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="boats">
              My Boats ({boats.length})
            </TabsTrigger>
            <TabsTrigger value="earnings">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="settings">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Pending Approval Bookings */}
            {pendingApprovalBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <span>Pending Approvals ({pendingApprovalBookings.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingApprovalBookings.map(booking => {
                      const boat = getBoatById(booking.boat_id);
                      return (
                        <div key={booking.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                          booking.is_custom_time 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-orange-50 border-orange-200'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{boat?.name}</h4>
                              {booking.is_custom_time && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  ⏰ Custom Time
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              {booking.customer_name} • {booking.guests} guests
                            </p>
                            <p className="text-sm text-slate-600">
                              {format(new Date(booking.start_date), 'MMM d, yyyy')} • 
                              {booking.start_time} - {booking.end_time}
                            </p>
                            {booking.special_requests && (
                              <p className="text-xs text-purple-600 mt-1">
                                💬 Special requests: {booking.special_requests}
                              </p>
                            )}
                            {booking.additional_services && booking.additional_services.length > 0 && (
                              <p className="text-xs text-indigo-600 mt-1">
                                🎯 Additional services: {booking.additional_services.map(service => service.name).join(', ')}
                              </p>
                            )}
                            {booking.is_custom_time && (
                              <p className="text-xs text-red-600 mt-1">
                                ⚠️ Outside regular hours - requires special approval
                              </p>
                            )}
                            {booking.status === 'confirmed' && (
                              <p className="text-xs text-green-600 mt-1">
                                ✅ Added to calendar - time slot unavailable
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-semibold">${booking.total_amount}</p>
                            <div className="space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => setActionDialog({ open: true, type: 'approve', booking })}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setActionDialog({ open: true, type: 'reject', booking })}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Bookings ({bookings.length})</span>
                  <Badge variant="outline" className="text-xs">
                    Debug: {bookings.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 10).map(booking => {
                      const boat = getBoatById(booking.boat_id);
                      return (
                        <div key={booking.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 ${
                          booking.is_custom_time ? 'border-l-4 border-l-red-400' : ''
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{boat?.name || `Boat ID: ${booking.boat_id}`}</h4>
                              {booking.is_custom_time && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  ⏰ Custom
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              {booking.customer_name} • {booking.guests} guests
                            </p>
                            <p className="text-sm text-slate-600">
                              {format(new Date(booking.start_date), 'MMM d, yyyy')} • {booking.start_time}-{booking.end_time}
                            </p>
                            {booking.additional_services && booking.additional_services.length > 0 && (
                              <p className="text-xs text-indigo-600 mt-1">
                                🎯 Services: {booking.additional_services.map(service => service.name).join(', ')}
                              </p>
                            )}
                            <p className="text-xs text-slate-400">
                              ID: {booking.id} | Boat: {booking.boat_id} | Status: {booking.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={`
                              ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                              ${booking.status === 'pending_approval' ? 'bg-orange-100 text-orange-800' : ''}
                              ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {booking.status}
                            </Badge>
                            <p className="text-sm text-slate-600 mt-1">
                              ${(booking.total_amount - booking.commission_amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-8">
                    <p>No bookings yet</p>
                    <p className="text-xs mt-2">Debug: Check console for booking data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs remain the same ... */}
        </Tabs>

        {/* Action Dialog */}
                              <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({...actionDialog, open})}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === 'reject' ? 'Review & Decline Booking' : 'Review & Approve Booking'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === 'reject' 
                  ? 'Review the booking details below. If you decline, the customer will be notified and any payments will be refunded.'
                  : 'Review the booking details below before approving. Once approved, this time slot will be marked as unavailable in your calendar.'
                }
              </DialogDescription>
            </DialogHeader>
            
            {actionDialog.booking && (
              <div className="space-y-6 py-4">
                {/* Boat Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Boat Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Boat:</span> {getBoatById(actionDialog.booking.boat_id)?.name || 'Unknown Boat'}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {getBoatById(actionDialog.booking.boat_id)?.location || 'Sydney Harbour'}
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Guests:</span> {actionDialog.booking.guests} people
                    </div>
                    <div>
                      <span className="font-medium">Customer:</span> Contact details will be provided after payment
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Date:</span> {format(new Date(actionDialog.booking.start_date), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {actionDialog.booking.start_time} - {actionDialog.booking.end_time}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {actionDialog.booking.total_hours || 'Calculating...'} hours
                    </div>
                    <div>
                      <span className="font-medium">Total Amount:</span> ${actionDialog.booking.total_amount}
                    </div>
                    {actionDialog.booking.is_custom_time && (
                      <div className="col-span-2">
                        <span className="font-medium text-red-600">⚠️ Custom Time Request</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Base Price:</span> ${actionDialog.booking.base_price || 0}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {actionDialog.booking.total_hours || 0} hours
                    </div>
                    {actionDialog.booking.additional_services && actionDialog.booking.additional_services.length > 0 && (
                      <>
                        <div>
                          <span className="font-medium">Services Cost:</span> $
                          {actionDialog.booking.additional_services.reduce((total, service) => {
                            if (service.pricing_type === 'per_hour') {
                              return total + (service.price * (actionDialog.booking.total_hours || 1));
                            } else {
                              return total + service.price;
                            }
                          }, 0).toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Total Amount:</span> ${actionDialog.booking.total_amount}
                        </div>
                      </>
                    )}
                    <div>
                      <span className="font-medium">Deposit:</span> ${actionDialog.booking.down_payment}
                    </div>
                    <div>
                      <span className="font-medium">Remaining Balance:</span> ${actionDialog.booking.remaining_balance}
                    </div>
                    <div>
                      <span className="font-medium">Card:</span> **** **** **** {actionDialog.booking.payment_details?.card_number || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span> {actionDialog.booking.payment_details?.expiry_date || 'N/A'}
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      💳 <strong>Payment Action:</strong> When you approve this booking, the deposit will be automatically charged to the customer's card.
                    </p>
                  </div>
                </div>

                {/* Additional Services */}
                {actionDialog.booking.additional_services && actionDialog.booking.additional_services.length > 0 && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-indigo-900 mb-2">Additional Services Booked</h3>
                    <div className="space-y-2">
                      {actionDialog.booking.additional_services.map((service, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-indigo-200">
                          <div>
                            <span className="font-medium text-indigo-800">{service.name}</span>
                            {service.description && (
                              <p className="text-xs text-indigo-600 mt-1">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-indigo-900">
                              ${service.price}
                            </span>
                            <span className="text-xs text-indigo-600 block">
                              {service.pricing_type === 'per_hour' ? 'per hour' : 'per booking'}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="mt-3 pt-2 border-t border-indigo-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-indigo-800">Total Services Cost:</span>
                          <span className="font-semibold text-indigo-900">
                            ${actionDialog.booking.additional_services.reduce((total, service) => {
                              if (service.pricing_type === 'per_hour') {
                                return total + (service.price * (actionDialog.booking.total_hours || 1));
                              } else {
                                return total + service.price;
                              }
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                {actionDialog.booking.special_requests && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Special Requests</h3>
                    <p className="text-sm text-purple-800">{actionDialog.booking.special_requests}</p>
                  </div>
                )}

                {/* Booking ID */}
                <div className="text-xs text-slate-500 text-center">
                  Booking ID: {actionDialog.booking.id}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setActionDialog({...actionDialog, open: false})}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const action = actionDialog.type === 'reject' ? 'rejected' : 'confirmed';
                  console.log('🔍 Action button clicked:', {
                    action,
                    bookingId: actionDialog.booking.id,
                    actionDialog: actionDialog
                  });
                  handleBookingAction(actionDialog.booking.id, action);
                }}
                className={actionDialog.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {actionDialog.type === 'reject' ? 'Decline Booking' : 'Approve Booking'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
