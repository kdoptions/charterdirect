import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Boat, Booking as BookingEntity, User } from "@/api/entities";
import { googleCalendarService } from "@/api/googleCalendarService";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, parse, differenceInHours } from 'date-fns';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  DollarSign, 
  Ship,
  Loader2,
  AlertCircle,
  Info
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [boat, setBoat] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [guests, setGuests] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    special_requests: ""
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("09:00");
  const [customEndTime, setCustomEndTime] = useState("13:00");

  const urlParams = new URLSearchParams(location.search);
  const boatId = urlParams.get('id');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("Loading booking data for boat ID:", boatId);
        
        if (!boatId) {
          setError("No boat specified.");
          setLoading(false);
          return;
        }

        // Fetch boat details
        const boatData = await Boat.filter({ id: boatId });
        console.log("Boat data found:", boatData);
        
        if (boatData.length === 0) {
          setError("Boat not found.");
          setLoading(false);
          return;
        }
        setBoat(boatData[0]);

        // Fetch user data
        try {
          const userData = await User.me();
          console.log("User data:", userData);
          setUser(userData);
          setCustomerDetails(prev => ({
            ...prev,
            name: userData?.full_name || "",
            email: userData?.email || ""
          }));
        } catch (userErr) {
          console.log("User not logged in, setting up guest booking");
          // For demo purposes, create a mock user
          const mockUser = {
            id: "guest-user",
            full_name: "",
            email: ""
          };
          setUser(mockUser);
        }

      } catch (err) {
        console.error("Error loading booking data:", err);
        setError("Failed to load booking data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [boatId]);

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedBlock(null); // Reset time block when date changes
    setAvailableSlots([]);
    
    if (date && boat) {
      setCheckingAvailability(true);
      try {
        // Check availability for the selected date
        const dateString = format(date, 'yyyy-MM-dd');
        const availability = await googleCalendarService.checkAvailability(
          boat.google_calendar_id || 'primary',
          `${dateString}T00:00:00Z`,
          `${dateString}T23:59:59Z`
        );
        
        if (availability.success) {
          // Filter out busy times and show available slots
          const availableBlocks = boat.availability_blocks?.filter(block => {
            const blockStart = new Date(`${dateString}T${block.start_time}:00`);
            const blockEnd = new Date(`${dateString}T${block.end_time}:00`);
            
            // Check if this time block conflicts with any existing bookings
            const isAvailable = !availability.busy.some(busyTime => {
              const busyStart = new Date(busyTime.start);
              const busyEnd = new Date(busyTime.end);
              return (blockStart < busyEnd && blockEnd > busyStart);
            });
            
            return isAvailable;
          }) || [];
          
          setAvailableSlots(availableBlocks);
        }
      } catch (error) {
        console.error('Availability check error:', error);
        // Fallback to showing all blocks if availability check fails
        setAvailableSlots(boat.availability_blocks || []);
      } finally {
        setCheckingAvailability(false);
      }
    }
  };

  const getPriceForDate = (date) => {
    if (!date || !boat) return boat?.price_per_hour || 0;

    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    const specialPrice = boat.special_pricing?.find(p => p.date === dateString);
    if (specialPrice) return specialPrice.price_per_hour;

    if ((dayOfWeek === 0 || dayOfWeek === 6) && boat.weekend_price) {
      return boat.weekend_price;
    }

    return boat.price_per_hour;
  };
  
  const pricePerHour = getPriceForDate(selectedDate);
  
  // Calculate hours for selected block or custom time
  const getTotalHours = () => {
    if (showCustomTime) {
      const start = new Date(`2000-01-01T${customStartTime}:00`);
      const end = new Date(`2000-01-01T${customEndTime}:00`);
      return Math.max(0, (end - start) / (1000 * 60 * 60));
    }
    return selectedBlock ? selectedBlock.duration_hours : 0;
  };
  
  const totalHours = getTotalHours();
  const totalAmount = pricePerHour * totalHours;

  const isFormValid = boat && selectedDate && 
    ((selectedBlock && !showCustomTime) || (showCustomTime && customStartTime && customEndTime)) && 
    guests > 0 && guests <= boat.max_guests && 
    customerDetails.name && customerDetails.email;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Create proper datetime strings for the booking
      const bookingDate = format(selectedDate, 'yyyy-MM-dd');
      const startTime = showCustomTime ? customStartTime : selectedBlock.start_time;
      const endTime = showCustomTime ? customEndTime : selectedBlock.end_time;
      const startDateTime = `${bookingDate}T${startTime}:00`;
      const endDateTime = `${bookingDate}T${endTime}:00`;
      
      const bookingData = {
        boat_id: boat.id,
        customer_id: user?.id || "guest-user",
        start_date: bookingDate,
        end_date: bookingDate,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        start_time: startTime,
        end_time: endTime,
        is_custom_time: showCustomTime,
        guests: Number(guests),
        total_hours: Number(totalHours),
        base_price: Number(pricePerHour),
        additional_services: [],
        total_amount: Number(totalAmount),
        commission_amount: Number(totalAmount * 0.10), // Assuming 10% commission
        down_payment: Number(totalAmount * (boat.down_payment_percentage / 100)),
        status: 'pending_approval', // New status for owner approval
        payment_status: 'pending',
        special_requests: customerDetails.special_requests,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        booking_reference: `BK${Date.now().toString().slice(-8).toUpperCase()}`,
        created_at: new Date().toISOString(),
      };

      console.log("Creating booking with data:", bookingData);
      const newBooking = await BookingEntity.create(bookingData);
      console.log("Booking created successfully:", newBooking);
        
        // Create Google Calendar event for the booking
        if (boat.google_calendar_id) {
          try {
            const calendarResult = await googleCalendarService.createBookingEvent(newBooking, boat);
            if (calendarResult.success) {
              console.log('Google Calendar event created:', calendarResult.eventId);
            }
          } catch (calendarError) {
            console.error('Calendar integration error:', calendarError);
          }
        }
        
        // Send notification to boat owner
        try {
          await googleCalendarService.sendBookingNotification(newBooking, boat);
        } catch (notificationError) {
          console.error('Notification error:', notificationError);
        }
        
        // Navigate to confirmation page
        navigate(createPageUrl(`BookingConfirmation?id=${newBooking.id}`));

    } catch (err) {
      console.error("Booking submission error:", err);
      setError("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600">Loading booking details...</p>
          {boatId && <p className="text-sm text-slate-500">Boat ID: {boatId}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Booking Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-slate-700 mb-6">{error}</p>
              <Button onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : !boat ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Boat Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-slate-700 mb-6">The boat you're trying to book could not be found.</p>
              <Button onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900">Request to Book</CardTitle>
              <div className="flex items-center space-x-2 text-slate-600 pt-2">
                <Ship className="w-5 h-5" />
                <span className="font-semibold">{boat.name}</span>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-slate-500 mt-2">
                  Debug: Boat ID {boatId} loaded successfully
                </div>
              )}
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Booking Details */}
              <div className="space-y-6">
                <div>
                  <Label className="font-bold text-lg">1. Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    className="rounded-md border mt-2"
                  />
                </div>
                
                <div>
                  <Label className="font-bold text-lg">2. Select Time</Label>
                  
                  {/* Availability Status */}
                  {selectedDate && (
                    <div className="mt-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          📅 {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </span>
                        <span className="text-sm text-blue-600">
                          {availableSlots.length} available slot{availableSlots.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {checkingAvailability ? (
                    <div className="mt-2 p-4 border rounded-lg bg-slate-50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Checking availability...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Standard Time Slots */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Available Time Slots</Label>
                        <Select 
                          onValueChange={(value) => {
                            setSelectedBlock(JSON.parse(value));
                            setShowCustomTime(false);
                          }}
                          disabled={!selectedDate || availableSlots.length === 0}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={
                              !selectedDate 
                                ? "Select a date first" 
                                : availableSlots.length === 0 
                                  ? "No available slots for this date" 
                                  : "Choose an available time slot"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSlots.map((block, index) => (
                              <SelectItem key={index} value={JSON.stringify(block)}>
                                <div className="flex items-center justify-between">
                                  <span>{block.name}: {block.start_time} - {block.end_time}</span>
                                  <span className="text-green-600 font-semibold">({block.duration_hours}h)</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Custom Time Option */}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-slate-700">Custom Time Request</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowCustomTime(!showCustomTime);
                              if (!showCustomTime) {
                                setSelectedBlock(null);
                              }
                            }}
                            className="text-xs"
                          >
                            {showCustomTime ? "Use Standard Slots" : "Request Custom Time"}
                          </Button>
                        </div>
                        
                        {showCustomTime && (
                          <div className="space-y-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-orange-800">Start Time</Label>
                                <Input
                                  type="time"
                                  value={customStartTime}
                                  onChange={(e) => setCustomStartTime(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-orange-800">End Time</Label>
                                <Input
                                  type="time"
                                  value={customEndTime}
                                  onChange={(e) => setCustomEndTime(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
                              ⚠️ Custom time requests require owner approval and may have different pricing.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedDate && availableSlots.length === 0 && !checkingAvailability && !showCustomTime && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        No available time slots for this date. Try requesting a custom time instead.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="guests" className="font-bold text-lg">3. Number of Guests</Label>
                  <Input 
                    id="guests"
                    type="number"
                    min="1"
                    max={boat.max_guests}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Maximum {boat.max_guests} guests allowed.</p>
                </div>
              </div>

              {/* Right Column: Customer & Payment */}
              <div className="space-y-6">
                <div>
                  <Label className="font-bold text-lg">4. Your Details</Label>
                  <div className="space-y-3 mt-2">
                    <Input placeholder="Full Name" value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} />
                    <Input placeholder="Email Address" type="email" value={customerDetails.email} onChange={e => setCustomerDetails({...customerDetails, email: e.target.value})} />
                    <Input placeholder="Phone Number" value={customerDetails.phone} onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})} />
                    <Textarea placeholder="Special requests (optional)" value={customerDetails.special_requests} onChange={e => setCustomerDetails({...customerDetails, special_requests: e.target.value})} />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg">Price Details</h3>
                  <div className="mt-2 space-y-2 p-4 border rounded-lg bg-slate-50">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Price per hour</span>
                      <span>${pricePerHour.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Booking duration</span>
                      <span>{totalHours} hours</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800 text-center">
                        <Info className="w-4 h-4 inline mr-1" />
                        <strong>No payment required yet.</strong> The boat owner will review your request and confirm availability within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Terms & Conditions</AlertTitle>
                    <AlertDescription className="text-xs max-h-20 overflow-y-auto">
                        {boat.terms_and_conditions || "Standard terms and conditions apply. Please arrive 15 minutes prior to departure."}
                    </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
               <Button 
                className="w-full luxury-gradient text-white" 
                size="lg"
                disabled={!isFormValid || isSubmitting}
                onClick={handleSubmit}
               >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  "Request Booking Approval"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}