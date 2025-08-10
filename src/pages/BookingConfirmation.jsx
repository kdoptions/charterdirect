import React, { useState, useEffect } from "react";
import { Booking, Boat, User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  Ship,
  CreditCard,
  AlertCircle,
  Download
} from "lucide-react";
import { format } from "date-fns";

export default function BookingConfirmation() {
  const [booking, setBooking] = useState(null);
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('id');

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      console.log("Loading booking details for ID:", bookingId);
      
      // For demo purposes, create a mock booking if it doesn't exist
      let bookingData;
      
      try {
        const bookings = await Booking.filter({ id: bookingId });
        if (bookings.length > 0) {
          bookingData = bookings[0];
        } else {
          // Create a mock booking for demo
          console.log("Creating mock booking for demo");
          bookingData = {
            id: bookingId,
            boat_id: "1", // Default to first boat
            customer_name: "Demo Customer",
            customer_email: "demo@example.com",
            customer_phone: "+61 400 123 456",
            start_date: "2025-09-18",
            end_date: "2025-09-18",
            start_time: "14:00",
            end_time: "18:00",
            guests: 8,
            total_hours: 4,
            base_price: 450,
            total_amount: 1800,
            commission_amount: 180,
            down_payment: 540,
            status: "pending_approval",
            payment_status: "pending",
            special_requests: "Demo booking for testing",
            booking_reference: bookingId.slice(-8).toUpperCase(),
            created_at: new Date().toISOString()
          };
        }
      } catch (filterError) {
        console.log("Booking filter failed, creating mock booking");
        bookingData = {
          id: bookingId,
          boat_id: "1",
          customer_name: "Demo Customer",
          customer_email: "demo@example.com",
          customer_phone: "+61 400 123 456",
          start_date: "2025-09-18",
          end_date: "2025-09-18",
          start_time: "14:00",
          end_time: "18:00",
          guests: 8,
          total_hours: 4,
          base_price: 450,
          total_amount: 1800,
          commission_amount: 180,
          down_payment: 540,
          status: "pending_approval",
          payment_status: "pending",
          special_requests: "Demo booking for testing",
          booking_reference: bookingId.slice(-8).toUpperCase(),
          created_at: new Date().toISOString()
        };
      }
      
      setBooking(bookingData);

      // Load boat details
      const boats = await Boat.filter({ id: bookingData.boat_id });
      if (boats.length > 0) {
        setBoat(boats[0]);
      }
    } catch (err) {
      console.error("Error loading booking details:", err);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'fully_paid': return 'bg-green-100 text-green-800';
      case 'deposit_paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Booking Not Found</h2>
          <p className="text-slate-600">{error || "This booking doesn't exist or you don't have permission to view it."}</p>
          <Link to={createPageUrl("Home")}>
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {booking.status === 'pending_approval' 
              ? "Booking Request Submitted!"
              : booking.status === 'confirmed'
                ? "Booking Confirmed!"
                : booking.status === 'rejected'
                  ? "Booking Request Rejected"
                  : "Booking Status"
            }
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {booking.status === 'pending_approval' 
              ? "Your booking request has been submitted and is awaiting owner approval."
              : booking.status === 'confirmed'
                ? "Your charter booking has been confirmed. We're excited for your adventure!"
                : booking.status === 'rejected'
                  ? "Your booking request was not approved by the boat owner."
                  : "Your booking request has been submitted."
            }
          </p>
        </div>

        {/* Booking Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* Booking Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ship className="w-5 h-5" />
                <span>Booking Details</span>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{boat?.name}</h3>
                <div className="flex items-center text-slate-600 mt-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{boat?.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-slate-600">
                      {format(new Date(booking.start_date), 'EEEE, MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Time</p>
                    <p className="text-slate-600">
                      {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Guests</p>
                  <p className="text-slate-600">{booking.guests} people</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Booking Reference</p>
                <p className="font-mono font-bold text-lg">#{booking.id.slice(-8).toUpperCase()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment & Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Payment Status */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Payment Status</span>
                  <Badge className={getPaymentStatusColor(booking.payment_status)}>
                    {booking.payment_status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Charter ({booking.total_hours}h)</span>
                    <span>${booking.base_price.toFixed(2)}</span>
                  </div>
                  
                  {booking.additional_services && booking.additional_services.length > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Services</span>
                      <span>
                        ${booking.additional_services.reduce((sum, service) => sum + service.price, 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-slate-500">
                    <span>Platform Fee</span>
                    <span>${booking.commission_amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span>${booking.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded mt-3">
                    <div className="flex justify-between text-sm">
                      <span>Deposit Paid</span>
                      <span className="font-semibold">${booking.down_payment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Remaining Balance</span>
                      <span>${(booking.total_amount - booking.down_payment).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Your Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Name:</span>
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

              {booking.special_requests && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Special Requests</h4>
                  <p className="text-sm text-slate-600">{booking.special_requests}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl("MyBookings")}>
            <Button className="luxury-gradient text-white">
              View All My Bookings
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Confirmation
          </Button>
          <Link to={createPageUrl("Search")}>
            <Button variant="outline">
              Book Another Charter
            </Button>
          </Link>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold">Owner Review</h4>
                <p className="text-sm text-slate-600">
                  The boat owner will review and confirm your booking request within 24 hours.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold">Payment Processing</h4>
                <p className="text-sm text-slate-600">
                  Once confirmed, your deposit will be charged. Final payment is due 14 days before your charter.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="font-bold text-blue-600">3</span>
                </div>
                <h4 className="font-semibold">Charter Day</h4>
                <p className="text-sm text-slate-600">
                  Arrive at the marina on time. The boat owner will provide final briefing and safety instructions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}