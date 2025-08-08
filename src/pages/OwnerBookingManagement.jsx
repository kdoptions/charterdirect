import React, { useState, useEffect } from "react";
import { Booking, Boat, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format, isPast, isFuture } from "date-fns";

export default function OwnerBookingManagement() {
  const [user, setUser] = useState(null);
  const [myBoats, setMyBoats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', booking: null });
  const [actionNote, setActionNote] = useState('');

  useEffect(() => {
    loadOwnerBookings();
  }, []);

  const loadOwnerBookings = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Load boats I own
      const boatsOwned = await Boat.filter({ owner_id: userData.id }, "-created_date");
      setMyBoats(boatsOwned);

      // Load bookings for my boats
      const boatIds = boatsOwned.map(boat => boat.id);
      let allBookings = [];
      
      if (boatIds.length > 0) {
        const bookingData = await Booking.list("-created_date", 100);
        allBookings = bookingData.filter(booking => boatIds.includes(booking.boat_id));
      }
      
      setBookings(allBookings);
    } catch (error) {
      console.error("Error loading owner bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (action, booking) => {
    try {
      const updateData = { 
        status: action === 'approve' ? 'confirmed' : 'cancelled' 
      };
      
      await Booking.update(booking.id, updateData);
      
      // Refresh bookings
      await loadOwnerBookings();
      
      // Close dialog
      setActionDialog({ open: false, type: '', booking: null });
      setActionNote('');
      
      // TODO: Send email notification to customer
      // TODO: Process payment if approved
      
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const openActionDialog = (type, booking) => {
    setActionDialog({ open: true, type, booking });
    setActionNote('');
  };

  const getBoatById = (boatId) => {
    return myBoats.find(boat => boat.id === boatId);
  };

  const filterBookings = (filter) => {
    return bookings.filter(booking => {
      switch (filter) {
        case 'pending':
          return booking.status === 'pending';
        case 'confirmed':
          return booking.status === 'confirmed';
        case 'upcoming':
          return booking.status === 'confirmed' && isFuture(new Date(booking.start_date));
        case 'past':
          return isPast(new Date(booking.start_date));
        case 'cancelled':
          return booking.status === 'cancelled';
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const BookingCard = ({ booking, showActions = false }) => {
    const boat = getBoatById(booking.boat_id);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{boat?.name}</CardTitle>
              <p className="text-sm text-slate-600">
                Booking #{booking.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Customer Info */}
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2">Customer Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{booking.customer_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{booking.customer_email}</span>
              </div>
              {booking.customer_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{booking.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{format(new Date(booking.start_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{booking.start_time} - {booking.end_time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{booking.guests} guests</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>${booking.total_amount} total</span>
            </div>
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div>
              <h5 className="font-medium text-sm mb-1">Special Requests</h5>
              <p className="text-sm text-slate-600 bg-blue-50 p-2 rounded">
                {booking.special_requests}
              </p>
            </div>
          )}

          {/* Earnings */}
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Your Earnings</span>
              <span className="font-bold text-green-800">
                ${(booking.total_amount - booking.commission_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          {showActions && booking.status === 'pending' && (
            <div className="flex space-x-2 pt-2 border-t">
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => openActionDialog('approve', booking)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1"
                onClick={() => openActionDialog('reject', booking)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          )}

          {booking.status === 'confirmed' && (
            <div className="flex space-x-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Customer
              </Button>
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Please Sign In</h2>
          <Button onClick={() => User.login()} className="luxury-gradient text-white">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const pendingBookings = filterBookings('pending');
  const confirmedBookings = filterBookings('confirmed');
  const upcomingBookings = filterBookings('upcoming');
  const pastBookings = filterBookings('past');
  const cancelledBookings = filterBookings('cancelled');

  const totalEarnings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_amount - b.commission_amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Booking Management</h1>
          <p className="text-slate-600 mt-2">
            Manage bookings for your boat listings
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
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
                  <p className="text-sm text-slate-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
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

        {/* Bookings Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No pending bookings</h3>
                  <p className="text-slate-600">New booking requests will appear here for your approval.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No upcoming bookings</h3>
                  <p className="text-slate-600">Confirmed future bookings will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {bookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} showActions={booking.status === 'pending'} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({...actionDialog, open})}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === 'approve' ? 'Approve Booking' : 'Decline Booking'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === 'approve' 
                  ? 'Confirm this booking and notify the customer. Payment will be processed automatically.'
                  : 'Decline this booking request. The customer will be notified and any deposits will be refunded.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {actionDialog.type === 'approve' ? 'Welcome message (optional)' : 'Reason for declining (optional)'}
                </label>
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    actionDialog.type === 'approve' 
                      ? 'Welcome aboard! Looking forward to hosting you...'
                      : 'Unfortunately we cannot accommodate this booking because...'
                  }
                  className="mt-1"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setActionDialog({...actionDialog, open: false})}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleBookingAction(actionDialog.type, actionDialog.booking)}
                className={
                  actionDialog.type === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {actionDialog.type === 'approve' ? 'Approve Booking' : 'Decline Booking'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}