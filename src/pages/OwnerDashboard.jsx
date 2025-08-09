
import React, { useState, useEffect } from "react";
import { Boat, Booking, User } from "@/api/entities";
import { stripeConnect } from "../components/api/stripeConnect";
import realGoogleCalendarService from "@/api/realGoogleCalendarService";
import { stripeService } from "@/api/stripeService";
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
  const [user, setUser] = useState(null);
  const [boats, setBoats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', booking: null });
  const [stripeConnected, setStripeConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    loadOwnerData();
  }, []);

  // Debug: Log whenever bookings state changes
  useEffect(() => {
    console.log("🔍 OwnerDashboard bookings state changed:", bookings);
  }, [bookings]);

  const loadOwnerData = async () => {
    try {
      let userData;
      
      // For demo purposes, always auto-login as test owner
      console.log("Auto-logging in as test owner for demo");
      userData = await User.loginAsOwner();
      console.log("Test owner loaded:", userData);
      
      setUser(userData);

      // Load boats owned by user
      console.log("Loading boats for owner ID:", userData.id);
      const userBoats = await Boat.filter({ owner_id: userData.id }, "-created_date");
      console.log("User boats found:", userBoats);
      setBoats(userBoats);

      // Load bookings for user's boats
      const allBookings = await Booking.filter();
      console.log("All bookings loaded:", allBookings);
      const boatIds = userBoats.map(boat => boat.id);
      console.log("Owner boat IDs:", boatIds);
      console.log("User ID:", userData.id);
      
      // Debug each booking to see why it's not matching
      allBookings.forEach(booking => {
        console.log(`Booking ${booking.id}: boat_id=${booking.boat_id}, matches=${boatIds.includes(booking.boat_id)}`);
      });
      
      const ownerBookings = allBookings.filter(booking => boatIds.includes(booking.boat_id));
      console.log("Owner bookings filtered:", ownerBookings);
      setBookings(ownerBookings);

      // Check integration status from user data instead of separate entity
      const hasStripe = userBoats.some(boat => boat.stripe_account_id);
      const hasCalendar = userData.google_calendar_integration || userData.calendar_integration_data;
      setStripeConnected(hasStripe);
      setCalendarConnected(!!hasCalendar);

    } catch (error) {
      console.error("Error loading owner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      const redirectUri = `${window.location.origin}/stripe-callback`;
      const oauthUrl = stripeConnect.getConnectOAuthUrl(user.id, redirectUri);
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Stripe connect error:", error);
    }
  };

  const handleCalendarConnect = async () => {
    try {
      const authUrl = realGoogleCalendarService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Calendar connect error:", error);
    }
  };

  const handleBookingAction = async (action, booking) => {
    try {
      if (action === 'confirmed') {
        console.log('✅ Approving booking and processing payment...');
        
        // Process the deposit payment
        if (booking.payment_details) {
          try {
            console.log('💳 Processing deposit payment...');
            console.log('💰 Deposit amount:', booking.down_payment);
            console.log('💳 Payment details:', booking.payment_details);
            
            // Create payment intent for the deposit
            const paymentIntentResult = await stripeService.createPaymentIntent({
              ...booking,
              total_amount: booking.down_payment // Only charge the deposit
            });
            
            if (paymentIntentResult.success) {
              console.log('✅ Payment intent created:', paymentIntentResult.paymentIntent.id);
              
              // Process the payment using the stored payment method
              if (booking.payment_method) {
                console.log('💳 Processing payment with stored payment method...');
                
                const paymentResult = await stripeService.processPaymentWithElements(
                  paymentIntentResult.paymentIntent,
                  booking.payment_method.id
                );
                
                if (paymentResult.success) {
                  console.log('✅ Payment processed successfully');
                  
                  // Update booking with payment status
                  await Booking.update(booking.id, {
                    status: 'confirmed',
                    payment_status: 'deposit_paid',
                    deposit_paid_at: new Date().toISOString(),
                    payment_intent_id: paymentIntentResult.paymentIntent.id
                  });
                } else {
                  console.error('❌ Payment processing failed:', paymentResult.error);
                  alert('Payment processing failed: ' + paymentResult.error);
                  return;
                }
              } else {
                console.log('💳 No payment method stored, simulating success for demo');
                
                // Update booking with payment status
                await Booking.update(booking.id, {
                  status: 'confirmed',
                  payment_status: 'deposit_paid',
                  deposit_paid_at: new Date().toISOString(),
                  payment_intent_id: paymentIntentResult.paymentIntent.id
                });
                
                console.log('✅ Payment processed successfully');
              }
            } else {
              console.error('❌ Payment intent creation failed:', paymentIntentResult.error);
              alert('Payment processing failed. Please try again.');
              return;
            }
          } catch (paymentError) {
            console.error('❌ Payment processing error:', paymentError);
            alert('Payment processing failed. Please try again.');
            return;
          }
        } else {
          // No payment details, just approve the booking
          await Booking.approve(booking.id);
        }
      } else if (action === 'rejected') {
        // Reject the booking
        const reason = prompt('Please provide a reason for rejection:') || 'No reason provided';
        await Booking.reject(booking.id, reason);
      } else {
        // Other actions
        const updateData = { status: action };
        await Booking.update(booking.id, updateData);
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
        
        // Check localStorage for tokens
        const userId = user?.id || 'test-owner-1';
        const tokens = localStorage.getItem(`google_tokens_${userId}`);
        
        if (tokens) {
          const tokenData = JSON.parse(tokens);
          const selectedCalendar = localStorage.getItem(`selected_calendar_${userId}`);
          
          if (tokenData.access_token && selectedCalendar) {
            console.log("Calendar integration found, attempting to create event...");
            try {
              const boat = getBoatById(booking.boat_id);
              
              // Construct ISO-compatible date strings
              const bookingDate = new Date(booking.start_date);
              const startDateString = bookingDate.toISOString().split('T')[0];
              
              // Convert time strings to full ISO format
              const startTimeISO = `${startDateString}T${booking.start_time}:00`;
              const endTimeISO = `${startDateString}T${booking.end_time}:00`;
              
              // Create event data with correct field names
              const eventData = {
                customer_name: booking.customer_name,
                guests: booking.guests,
                customer_email: booking.customer_email,
                customer_phone: booking.customer_phone,
                start_datetime: startTimeISO,
                end_datetime: endTimeISO,
                special_requests: booking.special_requests || 'None'
              };
              
              console.log("Creating event with data:", eventData);

              const result = await realGoogleCalendarService.createBookingEvent(selectedCalendar, eventData, tokenData.access_token);
              
              if (result.success) {
                console.log("✅ Successfully created Google Calendar event:", result.eventId);
                console.log("📅 Event link:", result.eventLink);
                console.log("🔒 Time slot is now marked as unavailable");
              } else {
                console.error("Failed to create calendar event:", result.error);
              }
              
            } catch (calendarError) {
              console.error("Failed to create Google Calendar event:", calendarError);
            }
          } else {
            console.log("Missing tokens or calendar selection");
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
                const userBoats = await Boat.filter({ owner_id: user?.id });
                console.log('🔍 Owner Dashboard Debug:');
                console.log('User ID:', user?.id);
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
                const userId = user?.id || 'test-owner-1';
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

        {/* Integration Alerts */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
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
                <strong>User ID:</strong> {user?.id || 'Not loaded'}
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
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Google Calendar Integration
              </CardTitle>
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
                  handleBookingAction(action, actionDialog.booking);
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
