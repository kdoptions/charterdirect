
import React, { useState, useEffect } from "react";
import { Boat, Booking, User } from "@/api/entities";
import { stripeConnect } from "../components/api/stripeConnect";
import { googleCalendar } from "../components/api/googleCalendar";
import { notifications } from "../components/api/notifications";
import { googleCalendarService } from "@/api/googleCalendarService";
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
      const authResult = await googleCalendar.initGoogleAuth();
      if (authResult.success) {
        window.location.href = authResult.authUrl;
      }
    } catch (error) {
      console.error("Calendar connect error:", error);
    }
  };

  const handleBookingAction = async (action, booking) => {
    try {
      if (action === 'confirmed') {
        // Approve the booking
        await Booking.approve(booking.id);
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
        console.log("User data:", user);
        
        if (user && (user.google_calendar_integration || user.calendar_integration_data)) {
          console.log("Calendar integration found, attempting to create event...");
          try {
            let integrationDetails;
            
            // Parse integration data correctly
            if (user.google_calendar_integration) {
              integrationDetails = user.google_calendar_integration;
              console.log("Using google_calendar_integration:", integrationDetails);
            } else if (user.calendar_integration_data) {
              integrationDetails = JSON.parse(user.calendar_integration_data);
              console.log("Using calendar_integration_data:", integrationDetails);
            }
            
            if (!integrationDetails) {
              console.log("No integration details found");
              throw new Error("No valid calendar integration found");
            }

            const boat = getBoatById(booking.boat_id);
            const { google_calendar_id, access_token } = integrationDetails;
            
            if (!google_calendar_id || !access_token) {
              console.log("Missing required calendar fields:", { google_calendar_id, access_token: access_token ? "present" : "missing" });
              throw new Error("Missing calendar ID or access token");
            }
            
            // Construct ISO-compatible date strings
            const bookingDate = new Date(booking.start_date);
            const startDateString = bookingDate.toISOString().split('T')[0];
            
            // Convert time strings to full ISO format (assuming times are in HH:mm format)
            const startTimeISO = `${startDateString}T${booking.start_time}:00`;
            const endTimeISO = `${startDateString}T${booking.end_time}:00`;
            
            console.log("Creating event with data:", {
              startTimeISO,
              endTimeISO,
              boatName: boat?.name,
              customerName: booking.customer_name
            });

            const eventData = {
              title: `Charter: ${boat?.name || 'Unknown Boat'}`,
              startTime: startTimeISO,
              endTime: endTimeISO,
              description: `Charter booking for ${booking.customer_name} (${booking.guests} guests).\n\nBooking Reference: #${booking.id.slice(-8).toUpperCase()}\nContact: ${booking.customer_email}${booking.customer_phone ? '\nPhone: ' + booking.customer_phone : ''}`,
              location: boat?.location || 'Sydney Harbour',
            };

            const result = await googleCalendar.createBookingEvent(google_calendar_id, eventData, access_token);
            
            if (result.success) {
              console.log("Successfully created Google Calendar event:", result.event);
              // You could show a success notification here
            } else {
              console.error("Failed to create calendar event:", result.error);
            }
            
          } catch (calendarError) {
            console.error("Failed to create Google Calendar event:", calendarError);
            console.error("Calendar error details:", calendarError.stack);
            // Don't block the main flow if calendar creation fails
          }
        } else {
          console.log("No calendar integration found for user");
          console.log("User calendar fields:", {
            google_calendar_integration: user?.google_calendar_integration ? "present" : "missing",
            calendar_integration_data: user?.calendar_integration_data ? "present" : "missing"
          });
        }
      }

      // Reload data
      await loadOwnerData();
      setActionDialog({ open: false, type: '', booking: null });
    } catch (error) {
      console.error("Booking action error:", error);
    }
  };

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
                            {booking.is_custom_time && (
                              <p className="text-xs text-red-600 mt-1">
                                ⚠️ Outside regular hours - requires special approval
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-semibold">${booking.total_amount}</p>
                            <div className="space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleBookingAction('confirmed', booking)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleBookingAction('rejected', booking)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === 'reject' ? 'Decline Booking' : 'Confirm Action'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === 'reject' 
                  ? 'Are you sure you want to decline this booking? The customer will be notified and any payments will be refunded.'
                  : 'Please confirm your action.'
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setActionDialog({...actionDialog, open: false})}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleBookingAction('cancelled', actionDialog.booking)}
                className={actionDialog.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {actionDialog.type === 'reject' ? 'Decline Booking' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
